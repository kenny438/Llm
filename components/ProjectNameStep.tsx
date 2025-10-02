import React from 'react';
import type { ProjectConfig } from '../types';
import Button from './Button';

interface ProjectNameStepProps {
  config: ProjectConfig;
  onUpdateConfig: (newConfig: Partial<ProjectConfig>) => void;
  onNext: () => void;
}

const ProjectNameStep: React.FC<ProjectNameStepProps> = ({ config, onUpdateConfig, onNext }) => {
  const handleNext = () => {
    if (config.name.trim()) {
      onNext();
    }
  };

  return (
    <div className="animate-slide-in">
      <h2 className="text-2xl font-bold text-brand-text-primary">Create a New Project</h2>
      <p className="mt-2 text-brand-text-secondary">Let's start by giving your new LLM project a name. This will be used to identify your dedicated workspace and server.</p>
      
      <div className="mt-8">
        <label htmlFor="project-name" className="block text-sm font-medium text-brand-text-secondary">
          Project Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="project-name"
            value={config.name}
            onChange={(e) => onUpdateConfig({ name: e.target.value })}
            className="block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-3 px-4 text-brand-text-primary focus:ring-brand-secondary focus:border-brand-secondary"
            placeholder="e.g., My Awesome Chatbot"
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleNext} disabled={!config.name.trim()}>
          Next: Data Integration
        </Button>
      </div>
    </div>
  );
};

export default ProjectNameStep;