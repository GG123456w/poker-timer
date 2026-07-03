import React from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { Users, UserCheck, Coins, Banknote } from 'lucide-react';

const LeftPanel: React.FC = () => {
  const { state } = useTimer();
  const { settings } = state;
  const { entrantCount, remainingCount, totalChips, isRegistrationClosed } = settings;

  const avgChips = remainingCount > 0 ? Math.round(totalChips / remainingCount) : 0;

  const items = [
    { icon: Users, label: '参赛人数', value: entrantCount, color: '#fbbf24' },
    { icon: UserCheck, label: '剩余人数', value: remainingCount, color: '#fbbf24' },
    { icon: Coins, label: '平均记分牌', value: avgChips.toLocaleString(), color: '#fbbf24' },
    { icon: Banknote, label: '总积分牌', value: totalChips.toLocaleString(), color: '#fbbf24' },
  ];

  return (
    <div
      className="rounded-2xl p-6 flex flex-col h-full"
      style={{
        background: 'rgba(20, 20, 20, 0.6)',
        border: '1px solid rgba(251, 191, 36, 0.25)',
        boxShadow: '0 0 30px rgba(251, 191, 36, 0.05)',
      }}
    >
      {items.map((it, idx) => {
        const Icon = it.icon;
        return (
          <React.Fragment key={it.label}>
            <div className="flex items-center gap-5 py-4 flex-1">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `radial-gradient(circle, ${it.color} 0%, #b45309 80%)`,
                  boxShadow: `0 0 20px ${it.color}80, inset 0 -3px 8px rgba(0,0,0,0.3)`,
                }}
              >
                <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 text-right">
                <div className="text-gray-300 text-lg font-medium mb-1">{it.label}</div>
                <div
                  className="text-white font-bold leading-none"
                  style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
                >
                  {it.value}
                </div>
              </div>
            </div>
            {idx < items.length - 1 && (
              <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            )}
          </React.Fragment>
        );
      })}

      {/* 报名状态 */}
      <div className="mt-4 text-center">
        {isRegistrationClosed ? (
          <div className="px-4 py-1.5 bg-red-600/90 text-white font-bold rounded text-sm">
            停止报名
          </div>
        ) : (
          <div className="px-4 py-1.5 bg-green-600/90 text-white font-bold rounded text-sm animate-pulse">
            接受报名
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
