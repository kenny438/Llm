
import React, { useState, useCallback, useEffect } from 'react';
import type { Project, ProjectConfig, TrainingMetric } from './types';
import { AppView, ProjectStatus } from './types';
import Dashboard from './components/Dashboard';
import ProjectWizard from './components/ProjectWizard';
import ProjectDetail from './components/ProjectDetail';
import Playground from './components/Playground';
import { streamDeploymentLog } from './services/geminiService';
import Button from './components/Button';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const handleCreateNewProject = (config: ProjectConfig) => {
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      config,
      status: ProjectStatus.PROVISIONING,
      logLines: [],
      metrics: [],
    };
    setProjects(prev => [...prev, newProject]);
    setCurrentView(AppView.DASHBOARD);
    // Kick off the deployment process with the new project object directly
    runDeployment(newProject);
  };

  const runDeployment = async (projectToRun: Project) => {
    const projectId = projectToRun.id;

    // Set initial log line
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, logLines: ['[INFO] Initiating deployment process...'] } : p));
    
    const stream = streamDeploymentLog(projectToRun.config);
    let buffer = '';

    for await (const chunk of stream) {
        buffer += chunk;
        const lines = buffer.split('\n');
        
        if (lines.length > 1) {
            const completeLines = lines.slice(0, -1);
            
            setProjects(prev => prev.map(p => {
                if (p.id !== projectId) return p;

                const newLogLines: string[] = [];
                const newMetrics: TrainingMetric[] = [];
                let newStatus = p.status;

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
                        if(line.includes('[TRAIN]')) newStatus = ProjectStatus.TRAINING;
                        if(line.includes('[DEPLOY]')) newStatus = ProjectStatus.DEPLOYING;
                    }
                });
                
                return { 
                    ...p, 
                    logLines: [...p.logLines, ...newLogLines], 
                    metrics: [...p.metrics, ...newMetrics], 
                    status: newStatus 
                };
            }));
            buffer = lines[lines.length - 1];
        }
    }
    // Final update for any remaining buffer and status
    setProjects(prev => prev.map(p => {
        if (p.id !== projectId) return p;
        const finalLogLines = buffer ? [...p.logLines, buffer] : p.logLines;
        return { ...p, status: ProjectStatus.ACTIVE, logLines: finalLogLines };
    }));
  };


  const handleViewProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView(AppView.PROJECT_DETAIL);
  };

  const handleLaunchPlayground = (projectId: string) => {
    setActiveProjectId(projectId);
    setCurrentView(AppView.PLAYGROUND);
  }

  const handleBackToDashboard = () => {
    setActiveProjectId(null);
    setCurrentView(AppView.DASHBOARD);
  };
  
  const handleStartCreation = () => {
      setCurrentView(AppView.PROJECT_WIZARD);
  }

  const renderContent = () => {
    const activeProject = projects.find(p => p.id === activeProjectId);

    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard projects={projects} onNewProject={handleStartCreation} onViewProject={handleViewProject} />;
      case AppView.PROJECT_WIZARD:
        return <ProjectWizard onCancel={handleBackToDashboard} onCreate={handleCreateNewProject} />;
      case AppView.PROJECT_DETAIL:
        return activeProject ? <ProjectDetail project={activeProject} onBack={handleBackToDashboard} onLaunch={handleLaunchPlayground} /> : null;
      case AppView.PLAYGROUND:
        return activeProject ? <Playground config={activeProject.config} onExit={handleBackToDashboard}/> : null;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen w-full bg-brand-background flex flex-col items-center font-sans p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-gray-700/[0.2] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative z-10 w-full flex flex-col items-center">
        <header className="text-center mb-8 animate-fade-in w-full max-w-7xl">
            <div className="flex justify-between items-center">
                <div className="flex-1 text-left">
                 {currentView !== AppView.DASHBOARD && (
                    <Button onClick={handleBackToDashboard} variant="secondary">
                        &larr; Back to Dashboard
                    </Button>
                 )}
                </div>
                 <div className="flex-1 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-brand-text-primary tracking-tight">
                        LLM Project Builder
                    </h1>
                    <p className="text-brand-text-secondary mt-2 text-lg">
                        Your personal AI factory. No DevOps required.
                    </p>
                </div>
                <div className="flex-1"></div>
            </div>
        </header>
        <div className="w-full max-w-7xl">
            {renderContent()}
        </div>
      </div>
    </main>
  );
};

export default App;
