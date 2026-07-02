import React from 'react';
import { useTimer } from '../../contexts/TimerContext';
import type { TimerSettings } from '../../types';

const TournamentInfoPanel: React.FC = () => {
  const { state, updateSettings } = useTimer();
  const { settings } = state;

  const handleChange = (key: keyof TimerSettings, value: string | number) => {
    updateSettings({ [key]: value } as Partial<TimerSettings>);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">赛事信息</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">赛事名称</label>
          <input type="text" value={settings.tournamentName} onChange={(e) => handleChange('tournamentName', e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-poker-gold focus:outline-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">俱乐部名称</label>
          <input type="text" value={settings.clubName} onChange={(e) => handleChange('clubName', e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-poker-gold focus:outline-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">参赛人数</label>
          <input type="number" min="1" value={settings.entrantCount} onChange={(e) => handleChange('entrantCount', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-poker-gold focus:outline-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">最大参赛</label>
          <input type="number" min="1" value={settings.maxEntrants} onChange={(e) => handleChange('maxEntrants', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-poker-gold focus:outline-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">初始记分牌</label>
          <input type="number" min="0" value={settings.startingChips} onChange={(e) => handleChange('startingChips', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-poker-gold focus:outline-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">总记分牌</label>
          <input type="number" min="0" value={settings.totalChips} onChange={(e) => handleChange('totalChips', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-poker-gold focus:outline-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">平均记分牌</label>
          <input type="number" min="0" value={settings.avgChips} onChange={(e) => handleChange('avgChips', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-poker-gold focus:outline-none" />
        </div>
        <div>
          <label className="block text-gray-400 text-sm mb-1">屏幕ID</label>
          <input type="text" value={settings.screenId} onChange={(e) => handleChange('screenId', e.target.value)} className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-poker-gold focus:outline-none" />
        </div>
      </div>
    </div>
  );
};

export default TournamentInfoPanel;
