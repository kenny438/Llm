import React, { useState, useRef } from 'react';
import type { ProjectConfig } from '../types';
import { performDeepResearch, extractTextFromPdf } from '../services/geminiService';
import Button from './Button';
import UploadIcon from './icons/UploadIcon';

type ResearchStatus = 'idle' | 'searching' | 'analyzing' | 'synthesizing' | 'complete' | 'error';
type ActiveTab = 'generate' | 'upload';

interface DataIntegrationStepProps {
  config: ProjectConfig;
  onUpdateConfig: (newConfig: Partial<ProjectConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

const statusMessages: Record<ResearchStatus, string> = {
    idle: 'Start Deep Research',
    searching: '[1/3] Searching web sources...',
    analyzing: '[2/3] Scraping and analyzing data...',
    synthesizing: '[3/3] Synthesizing research report...',
    complete: 'Research Complete',
    error: 'Research Failed',
};

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
            isActive
                ? 'bg-brand-surface text-brand-secondary border-b-2 border-brand-secondary'
                : 'text-brand-text-secondary hover:bg-gray-800'
        }`}
    >
        {label}
    </button>
);


const DataIntegrationStep: React.FC<DataIntegrationStepProps> = ({ config, onUpdateConfig, onNext, onBack }) => {
  const [researchStatus, setResearchStatus] = useState<ResearchStatus>('idle');
  const [topic, setTopic] = useState(config.datasetTopic || '');
  const [activeTab, setActiveTab] = useState<ActiveTab>('generate');
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateData = async () => {
    if (!topic.trim()) return;
    
    setResearchStatus('searching');
    await new Promise(res => setTimeout(res, 1500));
    setResearchStatus('analyzing');
    await new Promise(res => setTimeout(res, 1500));
    setResearchStatus('synthesizing');

    try {
        const { report, sources } = await performDeepResearch(topic);
        onUpdateConfig({
            datasetTopic: topic,
            generatedDataset: report,
            researchSources: sources,
            dataSource: { id: 'generated', name: `Deep Research: ${topic}` }
        });
        setResearchStatus('complete');
    } catch (error) {
        console.error("Failed to generate data:", error);
        setResearchStatus('error');
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
        setIsExtractingPdf(true);
        try {
            const content = await extractTextFromPdf(file);
            onUpdateConfig({
                datasetTopic: file.name,
                generatedDataset: content,
                researchSources: [],
                dataSource: { id: 'upload-report', name: `Uploaded: ${file.name}` }
            });
        } catch (error) {
            console.error("Error extracting text from PDF:", error);
        } finally {
            setIsExtractingPdf(false);
        }
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            onUpdateConfig({
                datasetTopic: file.name,
                generatedDataset: content,
                researchSources: [],
                dataSource: { id: 'upload-report', name: `Uploaded: ${file.name}` }
            });
        };
        reader.onerror = (e) => {
            console.error("Error reading file:", e);
        };
        reader.readAsText(file);
    }
  };

  const handleRemoveFile = () => {
    onUpdateConfig({
        datasetTopic: '',
        generatedDataset: '',
        researchSources: [],
        dataSource: null
    });
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };
  
  const isResearching = researchStatus === 'searching' || researchStatus === 'analyzing' || researchStatus === 'synthesizing';
  
  const renderGenerateTab = () => (
      <div className="mt-8 animate-fade-in">
        <h3 className="text-lg font-semibold text-brand-accent">Deep Research Data Synthesis</h3>
        <p className="mt-1 text-sm text-brand-text-secondary">This is the core of pre-training. Our AI will conduct deep research using Google Search to generate a comprehensive dataset based on your topic.</p>
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The history of quantum computing"
              className="flex-1 bg-gray-900 border-gray-600 rounded-md shadow-sm py-3 px-4 text-brand-text-primary focus:ring-brand-secondary focus:border-brand-secondary"
              disabled={isResearching}
            />
            <Button onClick={handleGenerateData} disabled={!topic.trim() || isResearching || researchStatus === 'complete'} className="w-full sm:w-auto">
              {isResearching ? <span className="animate-pulse">{statusMessages[researchStatus]}</span> : statusMessages[researchStatus]}
            </Button>
        </div>
        {config.generatedDataset && config.dataSource?.id === 'generated' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-4 border border-gray-700 bg-gray-900/50 rounded-lg animate-fade-in">
                <h4 className="font-semibold text-brand-text-primary">Generated Research Report:</h4>
                <p className="mt-2 text-sm text-brand-text-secondary whitespace-pre-wrap font-mono max-h-60 overflow-y-auto p-2 bg-black/20 rounded">{config.generatedDataset}</p>
            </div>
            <div className="p-4 border border-gray-700 bg-gray-900/50 rounded-lg animate-fade-in">
                <h4 className="font-semibold text-brand-text-primary">Sources Found:</h4>
                <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {config.researchSources?.map((source, index) => (
                      <li key={index} className="text-xs">
                          <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline truncate block">
                             {source.title}
                          </a>
                      </li>
                  ))}
                </ul>
            </div>
          </div>
        )}
      </div>
  );

  const renderUploadTab = () => (
    <div className="mt-8 animate-fade-in">
      <h3 className="text-lg font-semibold text-brand-accent">Upload Pre-existing Report</h3>
      <p className="mt-1 text-sm text-brand-text-secondary">Upload a document (.txt, .md, .pdf) to use as the pre-training dataset for your model.</p>
      
      {config.dataSource?.id === 'upload-report' && config.generatedDataset ? (
        <div className="mt-4 p-4 border border-gray-700 bg-gray-900/50 rounded-lg animate-fade-in">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-brand-text-primary">Uploaded Dataset: <span className="text-brand-accent font-mono">{config.datasetTopic}</span></h4>
                <Button onClick={handleRemoveFile} variant="secondary">Remove</Button>
            </div>
            <p className="mt-2 text-sm text-brand-text-secondary whitespace-pre-wrap font-mono max-h-60 overflow-y-auto p-2 bg-black/20 rounded">
                {config.generatedDataset?.substring(0, 500)}{config.generatedDataset && config.generatedDataset.length > 500 ? '...' : ''}
            </p>
        </div>
      ) : isExtractingPdf ? (
         <div className="mt-4 border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
            <div className="animate-pulse">
                <UploadIcon />
                <h3 className="mt-2 text-sm font-medium text-brand-text-primary">
                Extracting text from PDF...
                </h3>
                <p className="mt-1 text-xs text-brand-text-secondary">
                This may take a moment.
                </p>
            </div>
        </div>
      ) : (
        <div
          className="mt-4 border-2 border-dashed border-gray-600 rounded-lg p-12 text-center hover:border-brand-accent cursor-pointer transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon />
          <h3 className="mt-2 text-sm font-medium text-brand-text-primary">
            Click to upload a document
          </h3>
          <p className="mt-1 text-xs text-brand-text-secondary">
            TXT, MD, or PDF files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".txt,.md,text/plain,.pdf"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-slide-in">
      <h2 className="text-2xl font-bold text-brand-text-primary">Data Integration (Pre-training)</h2>
      <p className="mt-2 text-brand-text-secondary">Provide the data for your pre-training. You can generate a new dataset via AI research or upload an existing document.</p>
      
      <div className="mt-6 flex border-b border-gray-700">
        <TabButton label="AI Deep Research" isActive={activeTab === 'generate'} onClick={() => setActiveTab('generate')} />
        <TabButton label="Upload Report" isActive={activeTab === 'upload'} onClick={() => setActiveTab('upload')} />
      </div>

      {activeTab === 'generate' ? renderGenerateTab() : renderUploadTab()}

      <div className="mt-10 flex justify-between">
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
        <Button onClick={onNext} disabled={!config.dataSource}>
          Next: Fine-Tuning
        </Button>
      </div>
    </div>
  );
};

export default DataIntegrationStep;