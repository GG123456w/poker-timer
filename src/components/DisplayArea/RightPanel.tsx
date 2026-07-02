import React from 'react';
import { useTimer } from '../../contexts/TimerContext';

const RightPanel: React.FC = () => {
  const { state } = useTimer();
  const { levels, currentLevelIndex, settings } = state;
  const { avgChips, totalChips } = settings;

  // 北京时间：每次 TimerContext 的 250ms tick 触发 re-render
  const now = new Date();
  const formatTime = (date: Date) => {
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const nextBreak = levels.find((level, idx) => idx > currentLevelIndex && level.isBreak);
  const levelsToBreak = nextBreak ? nextBreak.level - currentLevelIndex : 0;

  return (
    <div className="flex flex-col h-full text-white">
      {/* 顶部：北京时间 */}
      <div className="text-right flex-shrink-0">
        <div className="font-semibold tracking-wider" style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.2rem)' }}>北京时间</div>
        <div className="font-bold tracking-wider leading-tight" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 2rem)' }}>
          {formatTime(now)}
        </div>
      </div>

      {/* 中下部：休息 + 记分牌 */}
      <div className="flex-1 flex flex-col justify-center items-end space-y-7">
        <div className="text-right">
          <div className="font-semibold tracking-wider" style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.2rem)' }}>下次休息</div>
          <div className="text-gray-400 font-semibold tracking-wider" style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1rem)' }}>Next break</div>
          <div className="font-bold mt-1 leading-none" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}>
            {levelsToBreak > 0 ? `${levelsToBreak}级后` : '无休息'}
          </div>
        </div>

        <div className="text-right">
          <div className="font-semibold tracking-wider" style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.2rem)' }}>平均记分牌</div>
          <div className="text-gray-400 font-semibold tracking-wider" style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1rem)' }}>Avg chips</div>
          <div className="font-bold mt-1 leading-none" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}>
            {avgChips.toLocaleString()}
          </div>
        </div>

        <div className="text-right">
          <div className="font-semibold tracking-wider" style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.2rem)' }}>总记分牌</div>
          <div className="text-gray-400 font-semibold tracking-wider" style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1rem)' }}>Total chips</div>
          <div className="font-bold mt-1 leading-none" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)' }}>
            {totalChips.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
