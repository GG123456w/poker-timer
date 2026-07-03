import React from 'react';
import { useTimer } from '../../contexts/TimerContext';

const RightPanel: React.FC = () => {
  const { state } = useTimer();
  const { levels, currentLevelIndex } = state;
  const nextLevel = levels[currentLevelIndex + 1];
  const isLast = currentLevelIndex >= levels.length - 1;

  return (
    <div
      className="rounded-2xl p-6 flex flex-col h-full text-white"
      style={{
        background: 'rgba(15, 20, 40, 0.7)',
        border: '1px solid rgba(96, 165, 250, 0.25)',
        boxShadow: '0 0 30px rgba(96, 165, 250, 0.08)',
      }}
    >
      {/* 下一阶段 */}
      <div className="text-center mb-2">
        <div className="text-blue-300 text-lg font-medium tracking-widest mb-2">下一阶段</div>
        <div
          className="font-black italic tracking-wider"
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            color: '#60a5fa',
            textShadow: '0 0 25px rgba(96, 165, 250, 0.5), 0 0 10px rgba(96, 165, 250, 0.3)',
          }}
        >
          {isLast ? '— —' : `LEVEL ${nextLevel?.level || (currentLevelIndex + 2)}`}
        </div>
      </div>

      {/* 箭头 */}
      <div className="text-center my-3 text-blue-400 text-3xl tracking-widest animate-pulse">
        &gt;&gt;&gt;
      </div>

      {/* 下一阶段盲注 */}
      <div className="text-center mt-4 mb-6">
        <div className="text-blue-300 text-lg font-medium mb-3">下一阶段盲注</div>
        <div
          className="font-bold leading-none"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            color: '#93c5fd',
            fontFamily: 'Consolas, monospace',
            textShadow: '0 0 20px rgba(147, 197, 253, 0.4)',
          }}
        >
          {isLast ? '—' : (nextLevel?.smallBlind || 0)}
          <span className="text-blue-500 mx-3">/</span>
          {isLast ? '—' : (nextLevel?.bigBlind || 0)}
        </div>
      </div>

      <div className="flex-1" />

      {/* 扑克牌图标（底部装饰） */}
      <div className="flex items-end justify-center gap-3 mt-6">
        <PlayingCard suit="♠" />
        <PlayingCard suit="♥" glow />
        <PlayingCard suit="♦" />
      </div>
    </div>
  );
};

// 扑克牌组件
const PlayingCard: React.FC<{ suit: string; glow?: boolean }> = ({ suit, glow }) => {
  const isRed = suit === '♥' || suit === '♦';
  return (
    <div
      className="relative w-20 h-28 rounded-lg flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        border: glow ? '2px solid #60a5fa' : '1px solid rgba(96, 165, 250, 0.4)',
        boxShadow: glow
          ? '0 0 30px rgba(96, 165, 250, 0.7), inset 0 0 20px rgba(96, 165, 250, 0.3)'
          : '0 0 15px rgba(96, 165, 250, 0.3)',
        transform: 'rotate(-5deg)',
      }}
    >
      <span
        className="text-4xl font-bold"
        style={{
          color: isRed ? '#ef4444' : '#60a5fa',
          textShadow: '0 0 10px currentColor',
        }}
      >
        {suit}
      </span>
    </div>
  );
};

export default RightPanel;
