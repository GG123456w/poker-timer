import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import type { BlindLevel } from '../../types';

interface LevelFormProps {
  level?: BlindLevel | null;
  onSave: (level: Omit<BlindLevel, 'id'> & { id?: string }) => void;
  onClose: () => void;
}

const LevelForm: React.FC<LevelFormProps> = ({ level, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    level: 1,
    smallBlind: 100,
    bigBlind: 200,
    ante: 0,
    duration: 15,
    isBreak: false,
  });

  useEffect(() => {
    if (level) setFormData({
      level: level.level,
      smallBlind: level.smallBlind,
      bigBlind: level.bigBlind,
      ante: level.ante,
      duration: level.duration,
      isBreak: level.isBreak || false,
    });
  }, [level]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: level?.id });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">{level ? '编辑级别' : '添加级别'}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <input type="checkbox" id="isBreak" checked={formData.isBreak} onChange={(e) => setFormData({ ...formData, isBreak: e.target.checked })} className="w-4 h-4" />
          <label htmlFor="isBreak" className="text-gray-300">休息级别</label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">级别</label>
            <input type="number" min="1" value={formData.level} onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-poker-gold focus:outline-none" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">小盲</label>
            <input type="number" min="0" value={formData.smallBlind} onChange={(e) => setFormData({ ...formData, smallBlind: parseInt(e.target.value) || 0 })} disabled={formData.isBreak} className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-poker-gold focus:outline-none disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">大盲</label>
            <input type="number" min="0" value={formData.bigBlind} onChange={(e) => setFormData({ ...formData, bigBlind: parseInt(e.target.value) || 0 })} disabled={formData.isBreak} className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-poker-gold focus:outline-none disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">底注</label>
            <input type="number" min="0" value={formData.ante} onChange={(e) => setFormData({ ...formData, ante: parseInt(e.target.value) || 0 })} disabled={formData.isBreak} className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-poker-gold focus:outline-none disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">时长(分钟)</label>
            <input type="number" min="1" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-poker-gold focus:outline-none" />
          </div>
        </div>

        <button type="submit" className="flex items-center justify-center gap-2 w-full py-3 bg-poker-gold text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors">
          <Plus size={20} />
          {level ? '保存更改' : '添加级别'}
        </button>
      </form>
    </div>
  );
};

export default LevelForm;
