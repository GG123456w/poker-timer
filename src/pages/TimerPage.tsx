import React, { useState, useEffect } from 'react';
import { useTimer } from '../contexts/TimerContext';
import CountdownDisplay from '../components/DisplayArea/CountdownDisplay';
import LeftPanel from '../components/DisplayArea/LeftPanel';
import RightPanel from '../components/DisplayArea/RightPanel';
import LevelProgressBar from '../components/DisplayArea/LevelProgressBar';
import { Maximize, Minimize } from 'lucide-react';

const TimerPage: React.FC = () => {
  const { state } = useTimer();
  const { settings } = state;
  const { tournamentTitle } = settings;
  const [showFullscreenBtn, setShowFullscreenBtn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // 整秒对齐的本地 tick：与 TimerContext 共享同一个整秒节奏
  // 第一次对齐到下一个整秒边界，之后每 1000ms 触发
  const [, setNow] = useState(0);
  useEffect(() => {
    let timeoutId: number;
    let stopped = false;
    const fire = () => {
      if (stopped) return;
      setNow(n => n + 1);
      timeoutId = window.setTimeout(fire, 1000);
    };
    const ms = 1000 - (Date.now() % 1000);
    timeoutId = window.setTimeout(fire, ms);
    return () => {
      stopped = true;
      clearTimeout(timeoutId);
    };
  }, []);
  const formatTime = (d: Date) =>
    `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) { console.error('全屏切换失败', e); }
  };

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden relative"
      style={{ background: '#000' }}
      onMouseMove={() => setShowFullscreenBtn(true)}
      onMouseLeave={() => setShowFullscreenBtn(false)}
    >
      {/* 悬浮全屏按钮 */}
      <div
        className={`absolute top-4 right-4 z-50 transition-opacity duration-300 ${
          showFullscreenBtn ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={toggleFullscreen}
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
          title={isFullscreen ? '退出全屏' : '全屏'}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>

      {/* 顶部：左 上 北京时间 / 中 大标题 */}
      <div className="grid grid-cols-12 gap-2 md:gap-6 px-3 md:px-6 pt-8 md:pt-10 flex-shrink-0">
        <div className="col-span-3 flex items-start">
          <div
            className="font-bold tracking-wider"
            style={{
              color: '#fbbf24',
              fontSize: 'clamp(1.4rem, 2.2vw, 2.4rem)',
              textShadow: '0 0 15px rgba(251, 191, 36, 0.5)',
            }}
          >
            {formatTime(new Date())}
          </div>
        </div>
        <div className="col-span-6 text-center">
          <div
            className="font-black tracking-wider leading-tight"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              background: 'linear-gradient(180deg, #ffffff 0%, #fde68a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.4))',
              fontFamily: 'Georgia, serif',
            }}
          >
            {tournamentTitle || 'All in 酒馆'}
          </div>
        </div>
        <div className="col-span-3" />
      </div>

      {/* 中部：左 / 中（倒计时+盲注） / 右 */}
      <div className="flex-1 grid grid-cols-12 gap-3 md:gap-6 px-3 md:px-6 py-3 md:py-4 min-h-0">
        <div className="col-span-3 min-h-0">
          <LeftPanel />
        </div>

        <div className="col-span-6 min-h-0">
          <CountdownDisplay />
        </div>

        <div className="col-span-3 min-h-0">
          <RightPanel />
        </div>
      </div>

      {/* 底部：级别进度条 */}
      <div className="flex-shrink-0 px-3 md:px-6 pb-4">
        <LevelProgressBar />
      </div>
    </div>
  );
};

export default TimerPage;
