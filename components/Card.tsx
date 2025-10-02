
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  onClick: () => void;
  isSelected: boolean;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, onClick, isSelected, icon }) => {
  return (
    <button
      onClick={onClick}
      className={`p-6 text-left rounded-xl border-2 transition-all duration-200 w-full h-full flex flex-col
        ${isSelected 
          ? 'bg-blue-900/40 border-brand-secondary shadow-lg scale-105' 
          : 'bg-brand-surface border-gray-700 hover:border-brand-accent hover:bg-gray-800/50'
        }`}
    >
      {icon && (
        <div className={`mb-3 ${isSelected ? 'text-brand-secondary' : 'text-brand-text-secondary'}`}>
            {icon}
        </div>
      )}
      {children}
    </button>
  );
};

export default Card;
