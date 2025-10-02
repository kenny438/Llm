import React, { useState, useEffect, useRef } from 'react';
import type { ProjectConfig, DataMethod, TrainingMetric } from '../types';
import { FINE_TUNING_METHODS } from '../constants';
import { streamFineTuningLog } from '../services/geminiService';
import Button from './Button';
import Card from './Card';
import DataIcon from './icons/DataIcon';
import MetricsChart from './MetricsChart';

interface FineTuningStepProps {
  config: ProjectConfig;
  onUpdateConfig: (newConfig: Partial<ProjectConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ModelLayer: React.FC<{ active: boolean; isAdapter?: boolean }> = ({ active, isAdapter }) => {
  const baseClasses = 'h-10 rounded transition-all duration-500';
  const adapterClasses = `w-1 ${active ? 'bg-brand-secondary animate-pulse' : 'bg-gray-700'}`;
  const fullLayerClasses = `flex-1 ${active ? 'bg-brand-secondary' : 'bg-gray-700'}`;
  return <div className={`${baseClasses} ${isAdapter ? adapterClasses : fullLayerClasses}`} />;
};

const FineTuningVisualizer: React.FC<{ method: DataMethod | null | undefined }> = ({ method }) => {
  if (!method) return null;
  const isPeft = method.id === 'parameter-efficient';
  const totalLayers = 12;

  return (
    <div className="bg-brand-surface rounded-lg shadow-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-brand-text-primary">Training Architecture</h3>
      <p className="text-sm text-brand-text-secondary mb-4">{isPeft ? 'PEFT: Only lightweight LoRA adapters are being trained.' : 'Full Tuning: All model parameters are being updated.'}</p>
      <div className="flex items-center justify-center gap-1.5 h-12 px-4">
        {Array.from({ length: totalLayers }).map((_, i) => (
            <React.Fragment key={i}>
                <ModelLayer active={!isPeft} />
                {isPeft && (i % 3 === 0) && <ModelLayer active={true} isAdapter />}
            </React.Fragment>
        ))}
      </div>
    </div>
  );
};


const FineTuningStep: React.FC<FineTuningStepProps> = ({ config, onUpdateConfig, onNext, onBack }) => {
  const [jobStatus, setJobStatus] = useState<'idle' | 'running' | 'complete' | 'error'>('idle');
  const [logLines, setLogLines] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<TrainingMetric[]>([]);
  const logRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logLines]);

  const runFineTuning = async (method: DataMethod) => {
    onUpdateConfig({ fineTuningMethod: method });
    setJobStatus('running');
    setLogLines(['[INFO] Initializing fine-tuning environment...']);
    setMetrics([]);

    try {
        const stream = streamFineTuningLog({ ...config, fineTuningMethod: method });
        let buffer = '';

        for await (const chunk of stream) {
            buffer += chunk;
            const lines = buffer.split('\n');
            
            if (lines.length > 1) {
                const completeLines = lines.slice(0, -1);
                
                const newLogLines: string[] = [];
                const newMetrics: TrainingMetric[] = [];
                
                completeLines.forEach(line => {
                    if (!line) return;
                    try {
                        const metric = JSON.parse(line);
                        if (metric.type === 'metric') {
                            newMetrics.push({ epoch: metric.epoch, loss: metric.loss });
                            newLogLines.push(`[TRAIN] Epoch ${metric.epoch}: Training Loss = ${metric.loss.toFixed(4)}`);
                        } else {
                           newLogLines.push(line);
                        }
                    } catch (e) {
                        newLogLines.push(line);
                    }
                });

                if (newLogLines.length > 0) {
                    setLogLines(prev => [...prev, ...newLogLines]);
                }
                if (newMetrics.length > 0) {
                    setMetrics(prev => [...prev, ...newMetrics]);
                }

                buffer = lines[lines.length - 1];
            }
        }
        if (buffer) {
            setLogLines(prev => [...prev, buffer]);
        }
        setJobStatus('complete');

    } catch(e) {
        console.error("Fine-tuning job failed:", e);
        setLogLines(prev => [...prev, '[ERROR] The fine-tuning process failed. Please check the console for details.']);
        setJobStatus('error');
    }
  };

  const handleReset = () => {
    onUpdateConfig({ fineTuningMethod: null });
    setJobStatus('idle');
    setLogLines([]);
    setMetrics([]);
  }

  const renderSelection = () => (
     <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-brand-text-primary">Select a Fine-tuning Method</h2>
        <p className="mt-2 text-brand-text-secondary">After pre-training on your generated dataset, how should the model be adapted to solidify its new knowledge?</p>

        <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FINE_TUNING_METHODS.map(method => (
                <Card
                    key={method.id}
                    onClick={() => runFineTuning(method)}
                    isSelected={false}
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
      </div>
    </div>
  );

  const renderJobMonitor = () => (
    <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-brand-text-primary">Fine-Tuning in Progress...</h2>
        <p className="mt-2 text-brand-text-secondary">Monitoring live job for model: <span className="font-semibold text-brand-accent">{config.model?.name}</span></p>
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
                 <FineTuningVisualizer method={config.fineTuningMethod} />
                 <div className="bg-brand-surface rounded-lg shadow-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">Live Training Metrics</h3>
                    <div className="h-64">
                        <MetricsChart data={metrics} />
                    </div>
                </div>
            </div>

             <div className="bg-brand-surface rounded-lg shadow-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4">Live Training Log</h3>
                <div ref={logRef} className="h-96 bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-y-auto scroll-smooth">
                    {logLines.map((line, index) => (
                        <div key={index} className="flex">
                            <span className="text-gray-500 mr-3 select-none">{`> `}</span>
                            <p className={`whitespace-pre-wrap ${line.toLowerCase().includes('success') || line.toLowerCase().includes('complete') ? 'text-green-400' : ''}`}>
                                {line}
                            </p>
                        </div>
                    ))}
                    {jobStatus === 'running' && (
                        <div className="w-2 h-4 bg-gray-300 animate-pulse ml-5 mt-1"></div>
                    )}
                </div>
            </div>
        </div>

        <div className="mt-10 flex justify-between">
            <Button onClick={handleReset} variant="secondary" disabled={jobStatus === 'running'}>
              Change Method
            </Button>
            <Button onClick={onNext} disabled={jobStatus !== 'complete'}>
              {jobStatus === 'complete' ? 'Next: Configure Compute' : 'Training...'}
            </Button>
        </div>
    </div>
  );


  return (
    <div className="min-h-[500px]">
        {jobStatus === 'idle' ? renderSelection() : renderJobMonitor()}
    </div>
  );
};

export default FineTuningStep;