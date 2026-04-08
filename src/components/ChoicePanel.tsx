import React from 'react';
import type { Choice } from '../types/interaction';

interface ChoicePanelProps {
  choices: Choice[];
  onSelect: (choiceId: string) => void;
}

export const ChoicePanel: React.FC<ChoicePanelProps> = ({ choices, onSelect }) => {
  return (
    <div className="grid gap-4">
      {choices.map((choice) => (
        <button
          key={choice.id}
          onClick={() => onSelect(choice.id)}
          className="w-full p-5 text-left bg-white border border-gray-200 rounded-xl text-[#1e1b4b] text-lg 
                    hover:bg-gray-50 hover:border-[#6d28d9] hover:scale-[1.01] 
                    transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <span className="font-medium">{choice.text}</span>
          {choice.hint && (
            <p className="mt-1 text-sm text-gray-500">{choice.hint}</p>
          )}
        </button>
      ))}
    </div>
  );
};