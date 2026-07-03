import React from 'react';
import { useTimer } from '../../contexts/TimerContext';

// 底部级别进度条：水平显示 LEVEL 1-5 (+ ...)，当前级别高亮
const LevelProgressBar: React.FC = () => {
  const { state } = useTimer();
  const { levels, currentLevelIndex } = state;

  // 取当前级别前后共 5 个级别
  const VISIBLE = 5;
  const start = Math.max(0, currentLevelIndex - 1);
  const end = Math.min(levels.length, start + VISIBLE);
  const slice = levels.slice(start, end);

  return (
    <div className="flex items-center justify-center gap-3 py-2">
      {start > 0 && (
        <div
          className="px-4 py-3 rounded-lg text-center"
          style={{
            background: 'rgba(40, 40, 40, 0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            minWidth: '120px',
          }}
        >
          <div className="text-gray-500 text-xs font-bold tracking-wider">...</div>
        </div>
      )}
      {slice.map((lvl, idx) => {
        const isCurrent = start + idx === currentLevelIndex;
        return (
          <div
            key={lvl.id}
            className="px-5 py-3 rounded-lg text-center transition-all"
            style={{
              background: isCurrent
                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                : 'rgba(30, 30, 30, 0.8)',
              border: isCurrent
                ? '1px solid #fde68a'
                : '1px solid rgba(255,255,255,0.08)',
              boxShadow: isCurrent
                ? '0 0 25px rgba(251, 191, 36, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.15)'
                : 'none',
              minWidth: '130px',
            }}
          >
            <div
              className={`text-xs font-bold tracking-widest mb-1 ${isCurrent ? 'text-amber-900' : 'text-gray-400'}`}
            >
              LEVEL {lvl.level}
            </div>
            <div
              className={`text-lg font-bold ${isCurrent ? 'text-amber-950' : 'text-white'}`}
              style={{ fontFamily: 'Consolas, monospace' }}
            >
              {lvl.smallBlind} / {lvl.bigBlind}
            </div>
          </div>
        );
      })}
      {end < levels.length && (
        <div
          className="px-4 py-3 rounded-lg text-center"
          style={{
            background: 'rgba(40, 40, 40, 0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            minWidth: '120px',
          }}
        >
          <div className="text-gray-500 text-xs font-bold tracking-wider">...</div>
        </div>
      )}
    </div>
  );
};

export default LevelProgressBar;
