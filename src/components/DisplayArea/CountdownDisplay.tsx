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
  // getDerived 返回当前基于 Date.now() 的实时数据
  const { levelRemaining, levelUsed } = getDerived();
  const currentLevel = state.levels[state.currentLevelIndex];
  const totalElapsed = getDerived().elapsedTime;

  // 警告：剩余 <= warningSeconds 时变红
  const isWarning = levelRemaining > 0 && levelRemaining <= state.settings.warningSeconds;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div
        className={`font-bold leading-none transition-all duration-200 ${
          isWarning ? 'text-red-500' : 'text-white'
        }`}
        style={{
          fontFamily: 'monospace, sans-serif',
          fontSize: 'clamp(6rem, 14vw, 14rem)',
          letterSpacing: '0.02em',
        }}
      >
        {formatTime(totalElapsed)}
      </div>
      {state.isRunning && levelUsed > 0 && (
        <div className="text-gray-500 mt-2 text-sm">
          本级 {formatTime(levelUsed)} / {currentLevel?.duration || 0}:00
        </div>
      )}
    </div>
  );
};

export default CountdownDisplay;
