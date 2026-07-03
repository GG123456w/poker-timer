import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { TimerState, BlindLevel, TimerSettings } from '../types';
import { loadState, saveState, loadSettings, saveSettings, saveLevels } from '../utils/storage';
import { playWarningBeep, playLevelUpBeep, playEndBeep } from '../utils/sound';
import { defaultSettings, defaultTemplates } from '../data/defaultTemplates';
import { cloudSetState } from '../utils/cloudSync';

type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'SKIP' }
  | { type: 'PREV' }
  | { type: 'CHECK_LEVEL_UP' }
  | { type: 'SET_LEVELS'; payload: BlindLevel[] }
  | { type: 'SET_CURRENT_LEVEL'; payload: number }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<TimerSettings> }
  | { type: 'MUTE_TOGGLE' }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'INIT'; payload: TimerState }
  | { type: 'RELOAD' };

const initialState: TimerState = {
  levels: defaultTemplates[0].levels,
  currentLevelIndex: 0,
  startedAt: 0,
  levelStartAt: 0,
  pausedAt: 0,
  elapsedTime: 0,
  levelStartTotal: 0,
  isRunning: false,
  settings: defaultSettings,
};

// 派生计算：从 startedAt + levelStartAt 算出当前 elapsedTime 和 levelStartTotal
export const deriveTimes = (state: TimerState): { elapsedTime: number; levelStartTotal: number; levelUsed: number; levelRemaining: number } => {
  const levelDur = (state.levels[state.currentLevelIndex]?.duration || 0) * 60; // 本级总时长（秒）
  // 完全未开始：起始数字 = 本级总时长（与盲注结构中每级分钟一致）
  if (!state.startedAt) {
    return { elapsedTime: 0, levelStartTotal: 0, levelUsed: 0, levelRemaining: levelDur };
  }
  // 暂停中：使用 pausedAt 作为时间基准
  if (!state.isRunning && state.pausedAt) {
    const usedAtPause = Math.floor((state.pausedAt - state.levelStartAt) / 1000);
    return {
      elapsedTime: state.elapsedTime,
      levelStartTotal: state.levelStartTotal,
      levelUsed: usedAtPause,
      levelRemaining: Math.max(0, levelDur - usedAtPause),
    };
  }
  // 计时中：实时计算
  const now = Date.now();
  const elapsedMs = now - state.startedAt;
  const levelStartMs = state.levelStartAt - state.startedAt;
  return {
    elapsedTime: Math.floor(elapsedMs / 1000),
    levelStartTotal: Math.floor(levelStartMs / 1000),
    levelUsed: Math.floor((now - state.levelStartAt) / 1000),
    levelRemaining: Math.ceil((levelDur * 1000 - (now - state.levelStartAt)) / 1000),
  };
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'INIT': return { ...action.payload };
    case 'START': {
      // 首次开始（startedAt = 0）设置时间基准
      if (!state.startedAt) {
        const now = Date.now();
        return {
          ...state,
          startedAt: now,
          levelStartAt: now,
          elapsedTime: 0,
          levelStartTotal: 0,
          isRunning: true,
          settings: { ...state.settings, isPaused: false },
        };
      }
      // 恢复暂停
      if (state.pausedAt) {
        const pauseDuration = Date.now() - state.pausedAt;
        return {
          ...state,
          startedAt: state.startedAt + pauseDuration,
          levelStartAt: state.levelStartAt + pauseDuration,
          pausedAt: 0,
          isRunning: true,
          settings: { ...state.settings, isPaused: false },
        };
      }
      return { ...state, isRunning: true, settings: { ...state.settings, isPaused: false } };
    }
    case 'PAUSE': return {
      ...state,
      isRunning: false,
      pausedAt: state.isRunning ? Date.now() : state.pausedAt,
      settings: { ...state.settings, isPaused: true },
    };
    case 'RESET': return {
      ...state,
      currentLevelIndex: 0,
      startedAt: 0,
      levelStartAt: 0,
      pausedAt: 0,
      elapsedTime: 0,
      levelStartTotal: 0,
      isRunning: false,
      settings: { ...state.settings, isPaused: false },
    };
    case 'SKIP': {
      const nextIndex = state.currentLevelIndex + 1;
      if (nextIndex >= state.levels.length) return { ...state, isRunning: false, settings: { ...state.settings, isPaused: false } };
      if (!state.settings.isMuted) playLevelUpBeep();
      // 跳级：更新 levelStartAt = 当前时间（让本级从 0 开始）
      const now = state.isRunning ? Date.now() : (state.startedAt || Date.now());
      return {
        ...state,
        currentLevelIndex: nextIndex,
        levelStartAt: now,
        levelStartTotal: state.elapsedTime,
      };
    }
    case 'PREV': {
      const prevIndex = state.currentLevelIndex - 1;
      if (prevIndex < 0) return state;
      const now = state.isRunning ? Date.now() : (state.startedAt || Date.now());
      return {
        ...state,
        currentLevelIndex: prevIndex,
        levelStartAt: now,
        levelStartTotal: state.elapsedTime,
      };
    }
    case 'CHECK_LEVEL_UP': {
      // 自动跳级：精确按 levelDuration 推进，无虚耗
      if (!state.isRunning || !state.levelStartAt) return state;
      const now = Date.now();
      const elapsed = now - state.levelStartAt;
      const levelDuration = (state.levels[state.currentLevelIndex]?.duration || 0) * 60 * 1000;
      if (elapsed < levelDuration) return state;
      // 跳级：levelStartAt += levelDuration（精确推进）
      const newLevelStartAt = state.levelStartAt + levelDuration;
      const nextIndex = state.currentLevelIndex + 1;
      if (nextIndex >= state.levels.length) {
        if (!state.settings.isMuted) playEndBeep();
        return { ...state, isRunning: false, levelStartAt: newLevelStartAt, settings: { ...state.settings, isPaused: false } };
      }
      if (!state.settings.isMuted) playLevelUpBeep();
      return { ...state, currentLevelIndex: nextIndex, levelStartAt: newLevelStartAt };
    }
    case 'SET_LEVELS': return {
      ...state,
      levels: action.payload,
      currentLevelIndex: Math.min(state.currentLevelIndex, Math.max(0, action.payload.length - 1)),
      levelStartAt: state.isRunning ? Date.now() : state.levelStartAt,
    };
    case 'SET_CURRENT_LEVEL': return {
      ...state,
      currentLevelIndex: action.payload,
      levelStartAt: state.isRunning ? Date.now() : state.levelStartAt,
      levelStartTotal: state.elapsedTime,
      isRunning: false,
      settings: { ...state.settings, isPaused: false },
    };
    case 'UPDATE_SETTINGS': {
      const newSettings = { ...state.settings, ...action.payload };
      const ec = newSettings.entrantCount;
      const tc = newSettings.totalChips;
      if (ec > 0) newSettings.avgChips = Math.floor(tc / ec);
      return { ...state, settings: newSettings };
    }
    case 'MUTE_TOGGLE': return { ...state, settings: { ...state.settings, isMuted: !state.settings.isMuted } };
    case 'TOGGLE_PAUSE': return { ...state, settings: { ...state.settings, isPaused: !state.settings.isPaused } };
    case 'RELOAD': {
      const ls = loadState();
      const lset = loadSettings();
      return {
        ...state,
        levels: ls.levels,
        currentLevelIndex: ls.currentLevelIndex,
        startedAt: ls.startedAt || 0,
        levelStartAt: ls.levelStartAt || 0,
        pausedAt: ls.pausedAt || 0,
        elapsedTime: ls.elapsedTime || 0,
        levelStartTotal: ls.levelStartTotal || 0,
        isRunning: ls.isRunning,
        settings: { ...state.settings, ...lset },
      };
    }
    default: return state;
  }
}

interface TimerContextType {
  state: TimerState;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  prev: () => void;
  setLevels: (levels: BlindLevel[]) => void;
  setCurrentLevel: (index: number) => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
  toggleMute: () => void;
  togglePause: () => void;
  // 派生数据（每次 render 时计算）
  getDerived: () => ReturnType<typeof deriveTimes>;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const [initialized, setInitialized] = useState(false);
  // 每 250ms 强制 re-render，让所有 tab 实时显示基于 Date.now() 的 elapsedTime
  const [, setTick] = useState(0);

  const stateRef = useRef(state);
  const lastWrittenRef = useRef<string>('');
  useEffect(() => { stateRef.current = state; }, [state]);

  // 初始化
  useEffect(() => {
    const savedState = loadState();
    dispatch({ type: 'INIT', payload: savedState });
    setInitialized(true);
  }, []);

  // 每 250ms 强制 re-render（让 UI 计算最新 elapsedTime）
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 1000000), 250);
    return () => clearInterval(id);
  }, []);

  // 跨标签页同步
  const bcRef = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('poker-timer-sync');
      bcRef.current = bc;
      bc.onmessage = (e) => {
        if (e.data === 'ping' || e.data === 'update') dispatch({ type: 'RELOAD' });
      };
    } catch {}

    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('poker-timer-')) dispatch({ type: 'RELOAD' });
    };
    window.addEventListener('storage', onStorage);

    let lastSeenState = localStorage.getItem('poker-timer-state-v8');
    let lastSeenSettings = localStorage.getItem('poker-timer-settings-v8');
    let lastSeenLevels = localStorage.getItem('poker-timer-levels-v8');
    const interval = setInterval(() => {
      const curState = localStorage.getItem('poker-timer-state-v8');
      const curSettings = localStorage.getItem('poker-timer-settings-v8');
      const curLevels = localStorage.getItem('poker-timer-levels-v8');
      if (curState !== lastSeenState || curSettings !== lastSeenSettings || curLevels !== lastSeenLevels) {
        lastSeenState = curState;
        lastSeenSettings = curSettings;
        lastSeenLevels = curLevels;
        dispatch({ type: 'RELOAD' });
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', onStorage);
      if (bc) bc.close();
      clearInterval(interval);
    };
  }, []);

  // state 变化时写 storage + 异步同步到云端（节流：1s 内只写一次）
  const lastCloudSyncRef = useRef<number>(0);

  // 自动跳级检查：只在 admin tab 跑（投屏页只显示）
  const [isAdmin, setIsAdmin] = useState<boolean>(
    () => typeof window !== 'undefined' && window.location.hash === '#/admin'
  );
  useEffect(() => {
    const check = () => setIsAdmin(window.location.hash === '#/admin');
    window.addEventListener('hashchange', check);
    return () => window.removeEventListener('hashchange', check);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const serialized = JSON.stringify(state);
    if (serialized === lastWrittenRef.current) return;
    lastWrittenRef.current = serialized;
    saveState(state);
    saveSettings(state.settings);
    saveLevels(state.levels);
    try { bcRef.current?.postMessage('update'); } catch {}

    // 异步同步到云端（节流：至少间隔 1 秒，避免 TICK 频繁触发）
    const now = Date.now();
    if (isAdmin && now - lastCloudSyncRef.current > 1000) {
      lastCloudSyncRef.current = now;
      cloudSetState({
        currentLevelIndex: state.currentLevelIndex,
        startedAt: state.startedAt,
        levelStartAt: state.levelStartAt,
        pausedAt: state.pausedAt,
        isRunning: state.isRunning,
        levels: state.levels,
        settings: state.settings,
      }).catch(() => {});
    }
  }, [state, initialized, isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    if (state.isRunning) {
      const id = setInterval(() => {
        dispatch({ type: 'CHECK_LEVEL_UP' });
        // 警告：仅本级剩余 <= warningSeconds 时响
        const cur = stateRef.current;
        const lvl = cur.levels[cur.currentLevelIndex];
        const levelDuration = (lvl?.duration || 0) * 60;
        const levelUsed = cur.levelStartAt ? Math.floor((Date.now() - cur.levelStartAt) / 1000) : 0;
        const levelRemaining = levelDuration - levelUsed;
        if (!cur.settings.isMuted && levelRemaining > 0 && levelRemaining <= cur.settings.warningSeconds) {
          playWarningBeep();
        }
      }, 1000);
      return () => clearInterval(id);
    }
  }, [state.isRunning, isAdmin]);

  const start = () => dispatch({ type: 'START' });
  const pause = () => dispatch({ type: 'PAUSE' });
  const reset = () => dispatch({ type: 'RESET' });
  const skip = () => dispatch({ type: 'SKIP' });
  const prev = () => dispatch({ type: 'PREV' });
  const setLevels = (levels: BlindLevel[]) => dispatch({ type: 'SET_LEVELS', payload: levels });
  const setCurrentLevel = (index: number) => dispatch({ type: 'SET_CURRENT_LEVEL', payload: index });
  const updateSettings = (settings: Partial<TimerSettings>) => dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  const toggleMute = () => dispatch({ type: 'MUTE_TOGGLE' });
  const togglePause = () => dispatch({ type: 'TOGGLE_PAUSE' });
  const getDerived = () => deriveTimes(stateRef.current);

  return (
    <TimerContext.Provider value={{ state, start, pause, reset, skip, prev, setLevels, setCurrentLevel, updateSettings, toggleMute, togglePause, getDerived }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) throw new Error('useTimer must be used within a TimerProvider');
  return context;
};
