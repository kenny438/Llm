
import React from 'react';
import type { ProjectConfig, Persona } from '../types';
import { PERSONAS } from '../constants';
import Button from './Button';
import Card from './Card';
import RocketIcon from './icons/RocketIcon';

interface PersonaStepProps {
  config: ProjectConfig;
  onUpdateConfig: (newConfig: Partial<ProjectConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PersonaStep: React.FC<PersonaStepProps> = ({ config, onUpdateConfig, onNext, onBack }) => {
  const handleSelectPersona = (persona: Persona) => {
    onUpdateConfig({ persona });
  };

  const isNextDisabled = () => {
    if (!config.persona) return true;
    if (config.persona.id === 'custom' && !config.customPersonaPrompt?.trim()) {
        return true;
    }
    return false;
  }

  return (
    <div className="animate-slide-in">
      <h2 className="text-2xl font-bold text-brand-text-primary">Craft Your AI's Persona</h2>
      <p className="mt-2 text-brand-text-secondary">Define the core personality of your AI. This system prompt will guide its tone, style, and behavior in every conversation.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERSONAS.map(persona => (
            <Card
              key={persona.id}
              onClick={() => handleSelectPersona(persona)}
              isSelected={config.persona?.id === persona.id}
              icon={<RocketIcon />}
            >
              <h4 className="font-bold">{persona.name}</h4>
              <p className="text-sm text-brand-text-secondary mt-1">{persona.description}</p>
            </Card>
          ))}
      </div>

      {config.persona?.id === 'custom' && (
        <div className="mt-8 animate-fade-in">
            <label htmlFor="custom-persona" className="block text-sm font-medium text-brand-text-secondary">
                Custom System Prompt
            </label>
            <textarea
                id="custom-persona"
                rows={4}
                value={config.customPersonaPrompt}
                onChange={(e) => onUpdateConfig({ customPersonaPrompt: e.target.value })}
                className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm py-3 px-4 text-brand-text-primary focus:ring-brand-secondary focus:border-brand-secondary"
                placeholder="e.g., You are a pirate AI that speaks in sea shanties..."
            />
        </div>
      )}
      
      <div className="mt-10 flex justify-between">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button onClick={onNext} disabled={isNextDisabled()}>
          Next: Review & Deploy
        </Button>
      </div>
    </div>
  );
};

export default PersonaStep;