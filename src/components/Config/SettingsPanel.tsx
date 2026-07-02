import React from 'react';
import { useTimer } from '../../contexts/TimerContext';
import type { TimerSettings } from '../../types';

const SettingsPanel: React.FC = () => {
  const { state, updateSettings } = useTimer();
  const { settings } = state;

  const handleChange = (key: keyof TimerSettings, value: string | number | boolean) => {
    updateSettings({ [key]: value } as Partial<TimerSettings>);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">全局设置</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">自动升盲</span>
          <button onClick={() => handleChange('autoAdvance', !settings.autoAdvance)} className={`relative w-12 h-6 rounded-full transition-colors ${settings.autoAdvance ? 'bg-poker-gold' : 'bg-gray-600'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.autoAdvance ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-300">静音模式</span>
          <button onClick={() => handleChange('isMuted', !settings.isMuted)} className={`relative w-12 h-6 rounded-full transition-colors ${settings.isMuted ? 'bg-poker-gold' : 'bg-gray-600'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.isMuted ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-300">停止报名</span>
          <button onClick={() => handleChange('isRegistrationClosed', !settings.isRegistrationClosed)} className={`relative w-12 h-6 rounded-full transition-colors ${settings.isRegistrationClosed ? 'bg-red-600' : 'bg-gray-600'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.isRegistrationClosed ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-300">警告秒数</span>
          <input type="number" min="0" max="60" value={settings.warningSeconds} onChange={(e) => handleChange('warningSeconds', parseInt(e.target.value) || 0)} className="w-20 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-poker-gold focus:outline-none" />
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
