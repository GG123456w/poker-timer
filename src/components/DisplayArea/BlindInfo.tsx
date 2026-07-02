import React from 'react';
import { useTimer } from '../../contexts/TimerContext';

const BlindInfo: React.FC = () => {
  const { state } = useTimer();
  const { levels, currentLevelIndex } = state;
  const currentLevel = levels[currentLevelIndex];

  if (!currentLevel) {
    return null;
  }

  if (currentLevel.isBreak) {
    return (
      <div className="text-left">
        <div className="text-poker-gold font-bold" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>休息时间</div>
        <div className="text-gray-400 mt-1" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.3rem)' }}>Level {currentLevel.level}</div>
      </div>
    );
  }

  const nextLevel = levels[currentLevelIndex + 1];

  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-5">
        {/* 基础分：标签在左 数字在右 */}
        <div className="flex flex-row items-end gap-8">
          <div className="text-right">
            <div className="text-white font-semibold tracking-wider leading-tight" style={{ fontSize: 'clamp(1.1rem, 1.5vw, 1.4rem)' }}>基础分</div>
            <div className="text-gray-400 font-semibold tracking-wider leading-tight" style={{ fontSize: 'clamp(0.85rem, 1.05vw, 1rem)' }}>BLINDS</div>
          </div>
          <div className="text-white font-bold leading-none" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
            {currentLevel.smallBlind}/{currentLevel.bigBlind}
          </div>
        </div>

        {/* 下级别：标签在左 数字在右 */}
        <div className="flex flex-row items-end gap-8">
          <div className="text-right">
            <div className="text-white font-semibold tracking-wider leading-tight" style={{ fontSize: 'clamp(1.1rem, 1.5vw, 1.4rem)' }}>下级别</div>
            <div className="text-gray-400 font-semibold tracking-wider leading-tight" style={{ fontSize: 'clamp(0.85rem, 1.05vw, 1rem)' }}>NEXT LEVEL</div>
          </div>
          {nextLevel ? (
            <div className="text-white font-bold leading-none" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
              {nextLevel.smallBlind}/{nextLevel.bigBlind}
              {nextLevel.ante > 0 ? `[${nextLevel.ante}]` : ''}
            </div>
          ) : (
            <div className="text-gray-600 font-bold leading-none" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>--</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlindInfo;
