import React, { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';
import LevelList from '../components/Config/LevelList';
import LevelForm from '../components/Config/LevelForm';
import SettingsPanel from '../components/Config/SettingsPanel';
import TemplateSelector from '../components/Config/TemplateSelector';
import TournamentInfoPanel from '../components/Config/TournamentInfoPanel';
import type { BlindLevel } from '../types';

interface ConfigPageProps { onBack: () => void; }

const ConfigPage: React.FC<ConfigPageProps> = ({ onBack }) => {
  const { state, setLevels } = useTimer();
  const { levels } = state;
  const [editingLevel, setEditingLevel] = useState<BlindLevel | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSaveLevel = (levelData: Omit<BlindLevel, 'id'> & { id?: string }) => {
    if (levelData.id) {
      setLevels(levels.map(l => l.id === levelData.id ? { ...l, ...levelData } : l));
    } else {
      const newLevel: BlindLevel = { ...levelData, id: Math.random().toString(36).substr(2, 9) } as BlindLevel;
      setLevels([...levels, newLevel].sort((a, b) => a.level - b.level));
    }
    setEditingLevel(null);
    setShowAddForm(false);
  };

  const handleDeleteLevel = (id: string) => {
    if (levels.length > 1) setLevels(levels.filter(l => l.id !== id));
  };

  const handleEditLevel = (level: BlindLevel) => {
    setEditingLevel(level);
    setShowAddForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={24} />
            <span className="text-lg">返回</span>
          </button>
          <h1 className="text-3xl font-bold text-white">盲注配置</h1>
          <div />
        </div>

        <div className="space-y-6">
          <TournamentInfoPanel />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <TemplateSelector />
            </div>
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">盲注级别</h3>
                <button onClick={() => { setShowAddForm(true); setEditingLevel(null); }} className="flex items-center gap-2 px-4 py-2 bg-poker-gold text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors">
                  <Plus size={20} />
                  添加级别
                </button>
              </div>
              {(showAddForm || editingLevel) ? (
                <LevelForm level={editingLevel} onSave={handleSaveLevel} onClose={() => { setShowAddForm(false); setEditingLevel(null); }} />
              ) : (
                <LevelList levels={levels} onEdit={handleEditLevel} onDelete={handleDeleteLevel} />
              )}
            </div>
            <div className="lg:col-span-2">
              <SettingsPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;
