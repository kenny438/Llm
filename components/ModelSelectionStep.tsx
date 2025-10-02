

import React from 'react';
import type { ProjectConfig, Model } from '../types';
import { MODELS } from '../constants';
import Button from './Button';
import Card from './Card';
import ModelIcon from './icons/ModelIcon';

interface ModelSelectionStepProps {
  config: ProjectConfig;
  onUpdateConfig: (newConfig: Partial<ProjectConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ModelSelectionStep: React.FC<ModelSelectionStepProps> = ({ config, onUpdateConfig, onNext, onBack }) => {
  const handleSelectModel = (model: Model) => {
    onUpdateConfig({ model });
  };
  
  const categories = ['General', 'Specialized'];
  const regularModels = MODELS.filter(m => m.id !== 'custom-upload');
  const customModel = MODELS.find(m => m.id === 'custom-upload')!;

  return (
    <div className="animate-slide-in">
      <h2 className="text-2xl font-bold text-brand-text-primary">Select a Base Model</h2>
      <p className="mt-2 text-brand-text-secondary">Choose the foundation for your project. We'll provision the necessary infrastructure based on your choice.</p>
      
      <div className="mt-8 space-y-8">
        {categories.map(category => (
          <div key={category}>
            <h3 className="text-lg font-semibold text-brand-accent">{category} Models</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regularModels.filter(m => m.category === category).map(model => (
                <Card 
                  key={model.id}
                  onClick={() => handleSelectModel(model)}
                  isSelected={config.model?.id === model.id}
                  icon={<ModelIcon />}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold">{model.name}</h4>
                    {model.parameters > 0 && (
                      <span className={`text-xs font-mono px-2 py-1 rounded-full ${config.model?.id === model.id ? 'bg-brand-background' : 'bg-gray-700'}`}>{model.parameters}B</span>
                    )}
                  </div>
                  <p className="text-sm text-brand-text-secondary mt-1">{model.description}</p>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <div>
            <h3 className="text-lg font-semibold text-brand-accent">Custom</h3>
            <div className="mt-4">
                <Card
                    key={customModel.id}
                    onClick={() => handleSelectModel(customModel)}
                    isSelected={config.model?.id === customModel.id}
                    icon={<ModelIcon />}
                >
                    <h4 className="font-bold">{customModel.name}</h4>
                    <p className="text-sm text-brand-text-secondary mt-1">{customModel.description}</p>
                </Card>
            </div>
        </div>
      </div>

      <div className="mt-10 flex justify-between">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button onClick={onNext} disabled={!config.model}>
          Next: Training Method
        </Button>
      </div>
    </div>
  );
};

export default ModelSelectionStep;