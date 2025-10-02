
import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            {stepIdx < currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-brand-secondary" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-brand-secondary rounded-full">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="absolute top-10 w-max -left-2 text-xs text-brand-text-primary">{step}</span>
              </>
            ) : stepIdx === currentStep ? (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-600" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-brand-surface border-2 border-brand-secondary rounded-full">
                  <span className="h-2.5 w-2.5 bg-brand-secondary rounded-full" aria-hidden="true" />
                </div>
                <span className="absolute top-10 w-max -left-2 text-xs font-semibold text-brand-secondary">{step}</span>
              </>
            ) : (
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-600" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center bg-brand-surface border-2 border-gray-600 rounded-full">
                </div>
                <span className="absolute top-10 w-max -left-2 text-xs text-brand-text-secondary">{step}</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepIndicator;
