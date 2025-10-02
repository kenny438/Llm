
import React from 'react';
import type { ProjectConfig, ComputeTier } from '../types';
import { COMPUTE_TIERS } from '../constants';
import Button from './Button';
import Card from './Card';
import ServerIcon from './icons/ServerIcon';

interface ComputeStepProps {
  config: ProjectConfig;
  onUpdateConfig: (newConfig: Partial<ProjectConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ComputeStep: React.FC<ComputeStepProps> = ({ config, onUpdateConfig, onNext, onBack }) => {
  const handleSelectTier = (tier: ComputeTier) => {
    onUpdateConfig({ computeTier: tier });
  };

  return (
    <div className="animate-slide-in">
      <h2 className="text-2xl font-bold text-brand-text-primary">Configure Compute Resources</h2>
      <p className="mt-2 text-brand-text-secondary">Select the virtual hardware for your job. Higher tiers provide more power for faster training but incur greater costs.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMPUTE_TIERS.map(tier => (
            <Card
              key={tier.id}
              onClick={() => handleSelectTier(tier)}
              isSelected={config.computeTier?.id === tier.id}
              icon={<ServerIcon />}
            >
                <div className="flex justify-between items-start">
                    <h4 className="font-bold">{tier.name}</h4>
                    <span className={`text-xs font-mono px-2 py-1 rounded-full ${config.computeTier?.id === tier.id ? 'bg-brand-background' : 'bg-gray-700'}`}>{tier.costIndicator}</span>
                </div>
              <p className="text-sm text-brand-text-secondary mt-2">{tier.description}</p>
              <p className="text-xs text-brand-accent mt-3 font-semibold">{tier.useCase}</p>
            </Card>
          ))}
      </div>
      
      <div className="mt-10 flex justify-between">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button onClick={onNext} disabled={!config.computeTier}>
          Next: Persona
        </Button>
      </div>
    </div>
  );
};

export default ComputeStep;