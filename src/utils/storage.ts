import type { TimerState, TimerSettings, BlindLevel } from '../types';
import { defaultTemplates, defaultSettings } from '../data/defaultTemplates';

const STORAGE_KEY = 'poker-timer-state-v9';
const SETTINGS_KEY = 'poker-timer-settings-v9';
const LEVELS_KEY = 'poker-timer-levels-v9';

export { STORAGE_KEY, SETTINGS_KEY, LEVELS_KEY };

(function cleanupOldKeys() {
  for (let i = 1; i <= 8; i++) {
    try { localStorage.removeItem(`poker-timer-state-v${i}`); } catch {}
    try { localStorage.removeItem(`poker-timer-settings-v${i}`); } catch {}
    try { localStorage.removeItem(`poker-timer-levels-v${i}`); } catch {}
  }
})();

const defaultState: TimerState = {
  levels: defaultTemplates[0].levels,
  currentLevelIndex: 0,
  startedAt: 0,
  levelStartAt: 0,
  pausedAt: 0,
  elapsedTime: 0,
  levelStartTotal: 0,
  isRunning: false,
  settings: defaultSettings as TimerSettings,
};

export const saveState = (state: TimerState): void => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { console.error('saveState failed', e); }
};

export const loadState = (): TimerState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<TimerState>;
      const savedSettingsRaw = localStorage.getItem(SETTINGS_KEY);
      const savedLevelsRaw = localStorage.getItem(LEVELS_KEY);
      const savedSettings = savedSettingsRaw ? JSON.parse(savedSettingsRaw) as Partial<TimerSettings> : {};
      const savedLevels = savedLevelsRaw ? JSON.parse(savedLevelsRaw) as BlindLevel[] : [];

      const validLevels = (arr: any): arr is BlindLevel[] =>
        Array.isArray(arr) && arr.length > 0 && arr.every(l => l && typeof l.smallBlind === 'number');

      let levelsToUse: BlindLevel[] = defaultState.levels;
      if (validLevels(parsed.levels)) levelsToUse = parsed.levels;
      else if (validLevels(savedLevels)) levelsToUse = savedLevels;

      return {
        ...defaultState,
        ...parsed,
        levels: levelsToUse,
        // 兼容旧版（v7 及更早）
        startedAt: typeof (parsed as any).startedAt === 'number' ? (parsed as any).startedAt : 0,
        levelStartAt: typeof (parsed as any).levelStartAt === 'number'
          ? (parsed as any).levelStartAt
          : (typeof (parsed as any).levelStartTotal === 'number' ? (parsed as any).levelStartTotal * 1000 : 0),
        pausedAt: typeof (parsed as any).pausedAt === 'number' ? (parsed as any).pausedAt : 0,
        elapsedTime: typeof (parsed as any).elapsedTime === 'number' ? (parsed as any).elapsedTime : 0,
        levelStartTotal: typeof (parsed as any).levelStartTotal === 'number' ? (parsed as any).levelStartTotal : 0,
        settings: { ...defaultState.settings, ...(parsed.settings || {}), ...savedSettings },
      };
    }
  } catch (e) { console.error('loadState parse failed', e); }
  return defaultState;
};

export const saveSettings = (settings: TimerSettings): void => {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { console.error('saveSettings failed', e); }
};

export const loadSettings = (): TimerSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) } as TimerSettings;
  } catch {}
  return defaultSettings as TimerSettings;
};

export const saveLevels = (levels: BlindLevel[]): void => {
  try { localStorage.setItem(LEVELS_KEY, JSON.stringify(levels)); } catch (e) { console.error('saveLevels failed', e); }
};

export const loadLevels = (): BlindLevel[] => {
  try {
    const saved = localStorage.getItem(LEVELS_KEY);
    if (saved) return JSON.parse(saved) as BlindLevel[];
  } catch {}
  return defaultTemplates[0].levels;
};
