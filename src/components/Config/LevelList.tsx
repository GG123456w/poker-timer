import React from 'react';
import { Trash2, Edit2, Coffee } from 'lucide-react';
import type { BlindLevel } from '../../types';

interface LevelListProps {
  levels: BlindLevel[];
  onEdit: (level: BlindLevel) => void;
  onDelete: (id: string) => void;
}

const LevelList: React.FC<LevelListProps> = ({ levels, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 overflow-x-auto">
      <h3 className="text-xl font-bold text-white mb-4">盲注级别列表</h3>
      <table className="w-full">
        <thead>
          <tr className="text-gray-400">
            <th className="text-left py-3 px-4">级别</th>
            <th className="text-left py-3 px-4">类型</th>
            <th className="text-left py-3 px-4">小盲</th>
            <th className="text-left py-3 px-4">大盲</th>
            <th className="text-left py-3 px-4">底注</th>
            <th className="text-left py-3 px-4">时长(分钟)</th>
            <th className="text-right py-3 px-4">操作</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((level) => (
            <tr key={level.id} className={`border-t border-gray-700 hover:bg-gray-700 ${level.isBreak ? 'bg-blue-900/20' : ''}`}>
              <td className="py-3 px-4 text-white font-semibold">Level {level.level}</td>
              <td className="py-3 px-4">
                {level.isBreak ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                    <Coffee size={12} />
                    休息
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">盲注</span>
                )}
              </td>
              <td className="py-3 px-4 text-white">{level.isBreak ? '-' : level.smallBlind}</td>
              <td className="py-3 px-4 text-white">{level.isBreak ? '-' : level.bigBlind}</td>
              <td className="py-3 px-4 text-poker-bronze">{level.isBreak ? '-' : level.ante}</td>
              <td className="py-3 px-4 text-white">{level.duration}</td>
              <td className="py-3 px-4 text-right">
                <button onClick={() => onEdit(level)} className="text-blue-400 hover:text-blue-300 mr-3"><Edit2 size={18} /></button>
                <button onClick={() => onDelete(level.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LevelList;
