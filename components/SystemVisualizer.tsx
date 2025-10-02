
import React from 'react';
import type { ProjectConfig } from '../types';

interface SystemVisualizerProps {
  config: ProjectConfig;
}

const SystemVisualizer: React.FC<SystemVisualizerProps> = ({ config }) => {
  return (
    <div className="bg-brand-surface rounded-lg shadow-lg p-6 border border-gray-700 h-80 flex flex-col justify-center items-center overflow-hidden">
      <h3 className="text-xl font-bold mb-4 text-brand-text-primary self-start">System Architecture</h3>
      <div className="w-full h-full flex items-center justify-center" style={{ perspective: '1000px' }}>
        <div className="relative w-64 h-64" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-20deg) rotateY(-30deg)' }}>
          {/* Compute Unit */}
          <div 
            className="absolute w-32 h-32 top-16 left-16 bg-blue-900/50 border-2 border-brand-secondary animate-pulse-fast rounded-lg" 
            style={{ 
              transform: 'translateZ(40px)',
              boxShadow: '0 0 20px rgba(96, 165, 250, 0.6)'
            }}
          >
             <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-2">
                <span className="text-xs font-bold text-brand-secondary">COMPUTE</span>
                <span className="text-xs text-brand-text-primary mt-1">{config.computeTier?.name}</span>
             </div>
          </div>
          {/* Model Core */}
           <div 
            className="absolute w-24 h-24 top-4 left-0 bg-purple-900/50 border-2 border-purple-400 rounded-lg" 
            style={{ 
              transform: 'translateZ(-20px)',
              boxShadow: '0 0 15px rgba(192, 132, 252, 0.5)'
            }}
           >
             <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-2">
                <span className="text-xs font-bold text-purple-400">MODEL</span>
                <span className="text-xs text-brand-text-primary mt-1">{config.model?.name}</span>
             </div>
          </div>
          {/* Data Storage */}
           <div 
            className="absolute w-28 h-28 top-32 right-0 bg-green-900/50 border-2 border-green-400 rounded-lg" 
            style={{ 
              transform: 'translateZ(-40px)',
              boxShadow: '0 0 15px rgba(74, 222, 128, 0.5)'
            }}
           >
              <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-2">
                <span className="text-xs font-bold text-green-400">DATA</span>
                <span className="text-xs text-brand-text-primary mt-1 truncate">{config.dataSource?.name}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemVisualizer;
