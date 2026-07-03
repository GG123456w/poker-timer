import React from 'react';
import { useTimer } from '../../contexts/TimerContext';

const formatTime = (seconds: number): string => {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const CountdownDisplay: React.FC = () => {
  const { state, getDerived } = useTimer();
  const { levelUsed } = getDerived();
  const currentLevel = state.levels[state.currentLevelIndex];
  // 显示的是本级别剩余时间（不是总用时）
  const levelDur = (currentLevel?.duration || 0) * 60;
  const levelRemain = Math.max(0, levelDur - levelUsed);
  const isWarning = levelRemain > 0 && levelRemain <= state.settings.warningSeconds;
  const fontSize = state.settings.countdownFontSize || 220;
  const color = state.settings.countdownColor || '#fbbf24';

  return (
    <div
      className="rounded-2xl p-8 flex flex-col items-center justify-center h-full"
      style={{
        background: 'rgba(15, 15, 15, 0.7)',
        border: '1px solid rgba(251, 191, 36, 0.2)',
        boxShadow: '0 0 40px rgba(251, 191, 36, 0.08)',
      }}
    >
      {/* 当前阶段标题 */}
      <div className="text-center mb-2">
        <div className="text-white text-2xl font-semibold tracking-widest">当前阶段</div>
      </div>

      {/* LEVEL 1 标签（金色斜体） */}
      <div
        className="font-black italic tracking-wider mb-2"
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.4))',
        }}
      >
        LEVEL {currentLevel?.level || 1}
      </div>

      {/* 大倒计时（金色椭圆发光） */}
      <div className="relative my-4 flex items-center justify-center w-full">
        <div
          className="absolute rounded-full"
          style={{
            width: '70%',
            height: '130%',
            border: `2px solid ${color}60`,
            boxShadow: `0 0 40px ${color}40, inset 0 0 30px ${color}20`,
            transform: 'scaleX(1.4) scaleY(0.9)',
          }}
        />
        <div
          className={`relative font-bold leading-none font-mono transition-all duration-200 ${
            isWarning ? '' : ''
          }`}
          style={{
            fontSize: `${fontSize}px`,
            color: isWarning ? '#ef4444' : color,
            textShadow: isWarning
              ? '0 0 40px rgba(239, 68, 68, 0.6), 0 0 20px rgba(239, 68, 68, 0.4)'
              : `0 0 40px ${color}80, 0 0 20px ${color}60`,
            fontFamily: 'Consolas, Monaco, monospace',
          }}
        >
          {formatTime(levelRemain)}
        </div>
      </div>

      {/* 当前盲注 */}
      <div className="text-center mt-4">
        <div className="text-white text-xl font-medium mb-2">当前盲注</div>
        <div
          className="text-white font-bold leading-none"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontFamily: 'Consolas, monospace',
          }}
        >
          {currentLevel?.smallBlind || 0}
          <span className="text-gray-400 mx-3">/</span>
          {currentLevel?.bigBlind || 0}
        </div>
      </div>
    </div>
  );
};

export default CountdownDisplay;
