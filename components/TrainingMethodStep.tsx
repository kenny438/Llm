
import React from 'react';
import type { ProjectConfig, DataMethod } from '../types';
import { DATA_METHODS } from '../constants';
import Button from './Button';
import Card from './Card';
import DataIcon from './icons/DataIcon';

interface TrainingMethodStepProps {
  config: ProjectConfig;
  onUpdateConfig: (newConfig: Partial<ProjectConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

const TrainingMethodStep: React.FC<TrainingMethodStepProps> = ({ config, onUpdateConfig, onNext, onBack }) => {
  const handleSelectMethod = (method: DataMethod) => {
    onUpdateConfig({ 
      dataMethod: method, 
      // Reset subsequent choices when method changes
      dataSource: null,
      datasetTopic: '',
      generatedDataset: '',
      fineTuningMethod: null,
    });
  };

  return (
    <div className="animate-slide-in">
      <h2 className="text-2xl font-bold text-brand-text-primary">Select a Training Method</h2>
      <p className="mt-2 text-brand-text-secondary">Choose the strategy for adapting your base model. This is a critical decision that impacts performance, cost, and training time.</p>

      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DATA_METHODS.map(method => (
            <Card
              key={method.id}
              onClick={() => handleSelectMethod(method)}
              isSelected={config.dataMethod?.id === method.id}
              icon={<DataIcon />}
            >
              <h4 className="font-bold">{method.name}</h4>
              <p className="text-sm text-brand-text-secondary mt-1">{method.description}</p>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mt-10 flex justify-between">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button onClick={onNext} disabled={!config.dataMethod}>
          Next: Data Integration
        </Button>
      </div>
    </div>
  );
};

export default TrainingMethodStep;