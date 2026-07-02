import React, { useState, useEffect } from 'react';
import { useTimer } from '../contexts/TimerContext';
import CountdownDisplay from '../components/DisplayArea/CountdownDisplay';
import BlindInfo from '../components/DisplayArea/BlindInfo';
import LeftPanel from '../components/DisplayArea/LeftPanel';
import RightPanel from '../components/DisplayArea/RightPanel';
import { Maximize, Minimize } from 'lucide-react';

interface TimerPageProps { onConfigClick?: () => void; }

const TimerPage: React.FC<TimerPageProps> = () => {
  const { state } = useTimer();
  const { settings } = state;
  const { eventTitle } = settings;
  const [showFullscreenBtn, setShowFullscreenBtn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (e) {
      console.error('全屏切换失败', e);
    }
  };

  return (
    <div
      className="h-screen w-full flex flex-col overflow-hidden relative"
      style={{
        background: 'radial-gradient(ellipse at center, #1a1410 0%, #050302 100%)',
        backgroundColor: '#050302',
      }}
      onMouseMove={() => setShowFullscreenBtn(true)}
      onMouseLeave={() => setShowFullscreenBtn(false)}
    >
      {/* 悬浮全屏按钮（鼠标移动时显示） */}
      <div
        className={`absolute top-4 right-4 z-50 transition-opacity duration-300 ${
          showFullscreenBtn ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={toggleFullscreen}
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200 hover:scale-110"
          title={isFullscreen ? '退出全屏' : '全屏'}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-2 md:gap-6 px-3 md:px-6 py-3 md:py-4 min-h-0">
        {/* Left Panel */}
        <div className="col-span-3 border-r border-white/10 pr-2 md:pr-4 min-h-0">
          <LeftPanel />
        </div>

        {/* Center Panel */}
        <div className="col-span-6 flex flex-col items-center min-h-0 px-2">
          {/* 顶部：赛事大标题（下移一点） */}
          <div className="text-center flex-shrink-0 w-full mt-12">
            <div
              className="font-black tracking-wider leading-tight"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                background: 'linear-gradient(135deg, #FFD700 0%, #FF6B35 50%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none',
                filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.4))',
              }}
            >
              {eventTitle}
            </div>
          </div>

          {/* 倒计时 - 居中显示 */}
          <div className="flex-1 flex items-center justify-center min-h-0 w-full" style={{ minHeight: '240px' }}>
            <CountdownDisplay />
          </div>

          {/* 盲注信息 */}
          <div className="w-full flex-shrink-0 pl-2">
            <BlindInfo />
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-3 border-l border-white/10 pl-2 md:pl-4 min-h-0">
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default TimerPage;
