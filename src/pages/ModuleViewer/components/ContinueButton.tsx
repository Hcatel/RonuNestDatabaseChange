import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ContinueButtonProps {
  onNext: () => void;
  isFinish?: boolean;
}

export function ContinueButton({ onNext, isFinish = false }: ContinueButtonProps) {
  return (
    <button
      onClick={onNext}
      className={`fixed bottom-8 right-8 z-50 flex items-center px-6 py-3 bg-[#ff4d00] hover:bg-[#e64600] rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5`}
    >
      <span className="text-white font-medium">
        {isFinish ? 'Finish' : 'Continue'}
      </span>
      <ChevronRight className="w-5 h-5 ml-2 text-white" />
    </button>
  );
}