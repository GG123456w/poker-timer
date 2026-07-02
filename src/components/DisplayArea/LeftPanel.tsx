import React from 'react';
import { useTimer } from '../../contexts/TimerContext';

const LeftPanel: React.FC = () => {
  const { state } = useTimer();
  const { levels, currentLevelIndex, settings } = state;
  const currentLevel = levels[currentLevelIndex];
  const { entrantCount, maxEntrants, isRegistrationClosed, tournamentName } = settings;

  return (
    <div className="flex flex-col h-full text-white">
      {/* 顶部：赛事名称 */}
      <div className="text-center flex-shrink-0">
        <div
          className="font-bold tracking-wider"
          style={{ fontSize: 'clamp(1.3rem, 2.2vw, 2rem)' }}
        >
          {tournamentName}
        </div>
      </div>

      {/* 中部：当前级别 + 参赛人数 + 停止报名 */}
      <div className="flex-1 flex flex-col justify-center items-center space-y-8">
        <div className="text-center">
          <div className="text-white font-semibold tracking-wider" style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.2rem)' }}>当前级别</div>
          <div className="text-gray-400 font-semibold tracking-wider" style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1rem)' }}>Current level</div>
          <div className="text-white font-bold mt-1 leading-none" style={{ fontSize: 'clamp(3.5rem, 7vw, 6rem)' }}>
            {currentLevel?.level || 1}
          </div>
        </div>

        <div className="text-center">
          <div className="text-white font-semibold tracking-wider" style={{ fontSize: 'clamp(0.95rem, 1.3vw, 1.2rem)' }}>参赛人数</div>
          <div className="text-gray-400 font-semibold tracking-wider" style={{ fontSize: 'clamp(0.8rem, 1.1vw, 1rem)' }}>Entrants</div>
          <div className="text-white font-bold mt-1 leading-none" style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)' }}>
            {entrantCount}/{maxEntrants}
          </div>
        </div>

        {isRegistrationClosed ? (
          <div
            className="px-6 py-1.5 bg-red-600 text-white font-bold rounded"
            style={{ fontSize: 'clamp(0.85rem, 1.1vw, 1.05rem)' }}
          >
            停止报名
          </div>
        ) : (
          <div
            className="px-6 py-1.5 bg-green-600 text-white font-bold rounded animate-pulse"
            style={{ fontSize: 'clamp(0.85rem, 1.1vw, 1.05rem)' }}
          >
            接受报名
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
