
import React from 'react';
import type { Project } from '../types';
import { ProjectStatus } from '../types';
import Button from './Button';

interface DashboardProps {
  projects: Project[];
  onNewProject: () => void;
  onViewProject: (projectId: string) => void;
}

const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
        case ProjectStatus.ACTIVE:
            return 'bg-green-500 text-green-50';
        case ProjectStatus.TRAINING:
        case ProjectStatus.PROVISIONING:
        case ProjectStatus.DEPLOYING:
            return 'bg-blue-500 text-blue-50 animate-pulse';
        case ProjectStatus.FAILED:
            return 'bg-red-500 text-red-50';
        default:
            return 'bg-gray-500 text-gray-50';
    }
}

const ProjectCard: React.FC<{project: Project, onViewProject: (id: string) => void}> = ({ project, onViewProject }) => (
    <div className="bg-brand-surface rounded-lg shadow-lg p-6 flex flex-col justify-between border border-gray-700 hover:border-brand-accent transition-colors duration-300">
        <div>
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-brand-text-primary">{project.config.name}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                    {project.status}
                </span>
            </div>
            <p className="text-sm text-brand-text-secondary mt-2">
                Model: <span className="font-semibold text-brand-text-primary">{project.config.model?.name}</span>
            </p>
            <p className="text-sm text-brand-text-secondary">
                Method: <span className="font-semibold text-brand-text-primary">{project.config.dataMethod?.name}</span>
            </p>
        </div>
        <div className="mt-6">
            <Button onClick={() => onViewProject(project.id)} variant="secondary" className="w-full">
                View Details & Monitor
            </Button>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ projects, onNewProject, onViewProject }) => {
  return (
    <div className="animate-fade-in w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-brand-text-primary">Projects</h2>
        <Button onClick={onNewProject}>+ Create New Project</Button>
      </div>
      
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => (
                <ProjectCard key={p.id} project={p} onViewProject={onViewProject} />
            ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-brand-surface rounded-lg border-2 border-dashed border-gray-700">
            <h3 className="text-xl font-semibold text-brand-text-primary">No projects yet!</h3>
            <p className="text-brand-text-secondary mt-2">Get started by creating your first LLM project.</p>
            <div className="mt-6">
                <Button onClick={onNewProject}>Create Your First Project</Button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
