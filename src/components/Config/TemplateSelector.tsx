import React from 'react';
import { defaultTemplates } from '../../data/defaultTemplates';
import { useTimer } from '../../contexts/TimerContext';

const TemplateSelector: React.FC = () => {
  const { setLevels } = useTimer();

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">预设模板</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {defaultTemplates.map((template, index) => (
          <button key={index} onClick={() => setLevels(template.levels)} className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left">
            <div className="text-white font-bold text-lg mb-1">{template.name}</div>
            <div className="text-gray-400 text-sm">{template.description}</div>
            <div className="text-poker-gold text-sm mt-2">{template.levels.length} 个级别</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
