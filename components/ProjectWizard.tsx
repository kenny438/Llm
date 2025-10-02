import React, { useState, useCallback } from 'react';
import type { ProjectConfig } from '../types';
import { MODELS, DATA_METHODS } from '../constants';
import ProjectNameStep from './ProjectNameStep';
import DataIntegrationStep from './DataIntegrationStep';
import ComputeStep from './ComputeStep';
import PersonaStep from './PersonaStep';
import ReviewStep from './ReviewStep';
import StepIndicator from './StepIndicator';
import FineTuningStep from './FineTuningStep';

interface ProjectWizardProps {
    onCancel: () => void;
    onCreate: (config: ProjectConfig) => void;
}

const STEPS = [
  'Project Name',
  'Data Integration',
  'Fine-Tuning',
  'Compute',
  'Persona',
  'Review & Deploy',
];

const ProjectWizard: React.FC<ProjectWizardProps> = ({ onCancel, onCreate }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [config, setConfig] = useState<ProjectConfig>({
      name: '',
      model: MODELS[0], // Hardcode LLaMA 3 70B as default
      dataMethod: DATA_METHODS[0], // Hardcode Pretraining
      fineTuningMethod: null,
      dataSource: null,
      datasetTopic: '',
      generatedDataset: '',
      researchSources: [],
      computeTier: null,
      persona: null,
      customPersonaPrompt: '',
    });

    const steps = STEPS;

    const updateConfig = useCallback((newConfig: Partial<ProjectConfig>) => {
        setConfig(prev => ({ ...prev, ...newConfig }));
    }, []);

    const nextStep = useCallback(() => {
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }, [steps.length]);

    const prevStep = useCallback(() => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    }, []);

    const handleDeploy = () => {
        onCreate(config);
    };

    const renderStep = () => {
        const stepName = steps[currentStep];

        switch (stepName) {
            case 'Project Name':
                return <ProjectNameStep config={config} onUpdateConfig={updateConfig} onNext={nextStep} />;
            case 'Data Integration':
                return <DataIntegrationStep config={config} onUpdateConfig={updateConfig} onNext={nextStep} onBack={prevStep} />;
            case 'Fine-Tuning':
                return <FineTuningStep config={config} onUpdateConfig={updateConfig} onNext={nextStep} onBack={prevStep} />;
            case 'Compute':
                return <ComputeStep config={config} onUpdateConfig={updateConfig} onNext={nextStep} onBack={prevStep} />;
            case 'Persona':
                return <PersonaStep config={config} onUpdateConfig={updateConfig} onNext={nextStep} onBack={prevStep} />;
            case 'Review & Deploy':
                return <ReviewStep config={config} onDeploy={handleDeploy} onBack={prevStep} />;
            default:
                return null;
        }
    }


    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
            <StepIndicator currentStep={currentStep} steps={steps} />
            <div className="mt-8 bg-brand-surface rounded-xl shadow-2xl p-6 md:p-10 border border-gray-700">
              {renderStep()}
            </div>
        </div>
    );
};

export default ProjectWizard;