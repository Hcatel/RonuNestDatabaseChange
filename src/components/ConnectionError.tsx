import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConnectionErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ConnectionError({ message = 'Unable to connect to the server', onRetry }: ConnectionErrorProps) {
  return (
    <div className="p-4 bg-red-50 rounded-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <p className="text-red-700">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}