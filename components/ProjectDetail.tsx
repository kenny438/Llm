import React, { useRef, useEffect, useState } from 'react';
import type { Project } from '../types';
import { ProjectStatus } from '../types';
import Button from './Button';
import MetricsChart from './MetricsChart';
import { generateModelCard } from '../services/geminiService';
import JSZip from 'jszip';
import SystemVisualizer from './SystemVisualizer';

interface ProjectDetailProps {
    project: Project;
    onBack: () => void;
    onLaunch: (projectId: string) => void;
}

const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.ACTIVE: return 'text-green-400';
        case ProjectStatus.TRAINING:
        case ProjectStatus.PROVISIONING:
        case ProjectStatus.DEPLOYING: return 'text-blue-400 animate-pulse';
        case ProjectStatus.FAILED: return 'text-red-400';
        default: return 'text-gray-400';
    }
}

type DownloadState = 'idle' | 'packaging' | 'compressing' | 'downloading' | 'error';
const downloadStatusMessages: Record<DownloadState, string> = {
    idle: 'Download Packaged Model',
    packaging: 'Packaging model artifacts...',
    compressing: 'Compressing weights...',
    downloading: 'Generating ZIP archive...',
    error: 'Download failed',
};

const createRunScript = (config: Project['config']): string => `
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# This is a sample script to demonstrate how to run your trained model locally.
# The actual model weights are not included in this package for size reasons.
# You would typically download them from a model hub or your own storage.

MODEL_NAME = "${config.model?.name || 'your-model-name'}"
MODEL_PATH = "./" # Assuming model files are in the same directory

print(f"Loading model: {MODEL_NAME} from {MODEL_PATH}")

try:
    # In a real scenario, you would have the model weights, config, and tokenizer files
    # in this directory.
    # tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    # model = AutoModelForCausalLM.from_pretrained(MODEL_PATH)
    print("--- SIMULATED MODEL LOAD ---")
    print("NOTE: This is a placeholder. To run this for real, you would need the actual model weight files in this directory.")

    # Let's define the persona prompt from your project
    persona_prompt = """${config.persona?.id === 'custom' ? config.customPersonaPrompt : config.persona?.prompt}"""

    def get_response(prompt):
        print(f"\\n> User: {prompt}")
        # In a real scenario, you would run model inference here
        # inputs = tokenizer(prompt, return_tensors="pt")
        # outputs = model.generate(**inputs)
        # response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(f"\\n> AI ({config.persona?.name}): (Simulated response based on your prompt)")


    print("\\n--- Model Terminal Ready ---")
    get_response("Hello, who are you?")
    get_response("What were you trained on?")

except Exception as e:
    print(f"\\nError: Could not simulate model loading.")
    print("This script expects model files (like config.json, pytorch_model.bin) to be in the same directory.")
    print("This package provides the structure and run scripts, but you need to provide the weights.")

`;


const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onLaunch }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [downloadState, setDownloadState] = useState<DownloadState>('idle');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [project.logLines]);

    const handleDownload = async () => {
        try {
            setDownloadState('packaging');
            setProgress(20);
            const modelCard = await generateModelCard(project.config);
            setProgress(50);
            
            await new Promise(res => setTimeout(res, 1000)); // Simulate work
            setDownloadState('compressing');
            
            const runScript = createRunScript(project.config);
            const zip = new JSZip();
            zip.file("README.md", modelCard);
            zip.file("run.py", runScript);
            zip.file("config.json", JSON.stringify({ note: "Placeholder model config. Replace with actual file." }, null, 2));
            zip.file("tokenizer.json", JSON.stringify({ note: "Placeholder tokenizer config. Replace with actual file." }, null, 2));

            setProgress(90);
            await new Promise(res => setTimeout(res, 1000)); // Simulate work
            setDownloadState('downloading');

            const blob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.config.name.replace(/\s+/g, '_')}_model.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setProgress(100);
            
            setTimeout(() => {
                setDownloadState('idle');
                setProgress(0);
            }, 3000);

        } catch (error) {
            console.error("Failed to package and download model:", error);
            setDownloadState('error');
             setTimeout(() => {
                setDownloadState('idle');
                setProgress(0);
            }, 3000);
        }
    };
    
    return (
        <div className="animate-fade-in">
            <div className="bg-brand-surface rounded-lg shadow-lg p-6 border border-gray-700 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-brand-text-primary">{project.config.name}</h2>
                        <p className="text-brand-text-secondary mt-1">
                            Status: <span className={`font-bold ${getStatusColor(project.status)}`}>{project.status}</span>
                        </p>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                         {project.status === ProjectStatus.ACTIVE && (
                            <Button onClick={() => onLaunch(project.id)} className="w-full sm:w-auto">
                                Launch Playground &rarr;
                            </Button>
                        )}
                         {project.status === ProjectStatus.ACTIVE && (
                            <Button onClick={handleDownload} disabled={downloadState !== 'idle'} variant="secondary" className="w-full sm:w-auto">
                                {downloadStatusMessages[downloadState]}
                            </Button>
                        )}
                    </div>
                </div>
                 {downloadState !== 'idle' && (
                    <div className="mt-4">
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-brand-secondary h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-brand-surface rounded-lg shadow-lg p-6 border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">Live Deployment Log</h3>
                    <div ref={scrollRef} className="h-96 bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-y-auto scroll-smooth">
                        {project.logLines.map((line, index) => (
                          <div key={index} className="flex">
                            <span className="text-gray-500 mr-3 select-none">{`> `}</span>
                            <p className={`whitespace-pre-wrap ${line.toLowerCase().includes('success') || line.toLowerCase().includes('complete') ? 'text-green-400' : ''}`}>
                                {line}
                            </p>
                          </div>
                        ))}
                         {project.status !== ProjectStatus.ACTIVE && project.status !== ProjectStatus.FAILED && (
                             <div className="w-2 h-4 bg-gray-300 animate-pulse ml-5 mt-1"></div>
                         )}
                    </div>
                </div>
                <div className="flex flex-col gap-6">
                    <SystemVisualizer config={project.config} />
                    <div className="bg-brand-surface rounded-lg shadow-lg p-6 border border-gray-700">
                        <h3 className="text-xl font-bold mb-4">Training Metrics</h3>
                        <div className="h-80">
                            <MetricsChart data={project.metrics} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
