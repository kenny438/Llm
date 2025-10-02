import React, { useState, useEffect, useRef } from 'react';
import type { ProjectConfig } from '../types';
import Button from './Button';

interface ReviewStepProps {
  config: ProjectConfig;
  onDeploy: () => void;
  onBack: () => void;
}

const ReviewItem: React.FC<{ label: string; value: string | null | undefined | number }> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row justify-between py-4 border-b border-gray-700 last:border-b-0">
    <dt className="font-medium text-brand-text-secondary">{label}</dt>
    <dd className="mt-1 sm:mt-0 text-brand-text-primary font-semibold text-right">{value || 'Not selected'}</dd>
  </div>
);

const formatNumber = (num: number): string => { // num is in millions
    if (num < 1000) return `${num.toFixed(1)}M`;
    return `${(num / 1000).toFixed(1)}B`;
}

const AnimatedCounter: React.FC<{ target: number }> = ({ target }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
        let start = 0;
        const duration = 1500;
        const end = target;
        if (start === end) return;

        let startTime: number | null = null;
        
        const animate = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const currentVal = progress * end;
            setCount(currentVal);
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(end); // Ensure it ends on the exact value
            }
        };

        requestAnimationFrame(animate);
    }, [target]);

    return <span>{formatNumber(count)}</span>;
}

const getTrainableParamsInMillions = (config: ProjectConfig): number => {
    const baseParamsInBillions = config.model?.parameters || 0;
    if (baseParamsInBillions === 0) return 0;

    let trainingMethod = config.dataMethod;
    if (config.dataMethod?.id === 'pretraining') {
        trainingMethod = config.fineTuningMethod;
    }

    const baseParamsInMillions = baseParamsInBillions * 1000;

    switch (trainingMethod?.id) {
        case 'full-fine-tuning':
             return baseParamsInMillions;
        case 'parameter-efficient':
            // LoRA is typically ~0.01% to 1% of parameters. Let's use 0.1%.
            return baseParamsInMillions * 0.001;
        case 'rag':
            return 0;
        default:
            return 0; // Not yet selected
    }
}


const ReviewStep: React.FC<ReviewStepProps> = ({ config, onDeploy, onBack }) => {
  const trainableParams = getTrainableParamsInMillions(config);

  return (
    <div className="animate-slide-in">
      <h2 className="text-2xl font-bold text-brand-text-primary">Review Your Configuration</h2>
      <p className="mt-2 text-brand-text-secondary">Please confirm the details below. Once you proceed, we will provision your dedicated server and start the training pipeline.</p>
      
      <div className="mt-8 bg-gray-900/50 rounded-lg p-6 border border-gray-700">
        <dl>
          <ReviewItem label="Project Name" value={config.name} />
          <ReviewItem label="Base Model" value={`${config.model?.name} (${config.model?.parameters}B params)`} />
          <ReviewItem label="Training Method" value={config.dataMethod?.name} />
           {config.dataMethod?.id === 'pretraining' && (
            <ReviewItem label="Fine-Tuning Method" value={config.fineTuningMethod?.name} />
          )}
          {config.dataMethod?.id === 'pretraining' ? (
             config.dataSource?.id === 'upload-report' ? (
                <ReviewItem label="Uploaded Dataset" value={config.datasetTopic} />
             ) : (
                <>
                  <ReviewItem label="Deep Research Topic" value={config.datasetTopic} />
                  <ReviewItem label="Web Sources Found" value={config.researchSources?.length || 0} />
                </>
             )
          ) : (
             <ReviewItem label="Data Source" value={config.dataSource?.name} />
          )}
           <ReviewItem label="Compute Tier" value={`${config.computeTier?.name} (${config.computeTier?.costIndicator})`} />
           <ReviewItem label="Persona" value={config.persona?.name} />
           <div className="flex flex-col sm:flex-row justify-between py-4">
                <dt className="font-medium text-brand-text-secondary">Trainable Parameters</dt>
                <dd className="mt-1 sm:mt-0 text-brand-accent font-semibold text-right text-lg">
                    {trainableParams > 0 ? <AnimatedCounter target={trainableParams} /> : '0'}
                </dd>
            </div>
        </dl>
      </div>

      <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-md text-yellow-300">
        <p className="font-bold">Confirmation Required</p>
        <p className="text-sm">Provisioning GPU/TPU resources can be expensive. By clicking deploy, you confirm you are ready to start the process.</p>
      </div>

      <div className="mt-10 flex justify-between">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button onClick={onDeploy} variant="primary">
          Provision & Train
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;
