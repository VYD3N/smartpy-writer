
import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

interface CodeBlockProps {
  code: string;
  isLoading: boolean;
  loadingText?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, isLoading, loadingText = "Generating your contract..." }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    // For debug responses, we might have markdown. Let's try to find and copy only the python block.
    const pythonBlockMatch = code.match(/```python\n([\s\S]*?)```/);
    const textToCopy = pythonBlockMatch && pythonBlockMatch[1] ? pythonBlockMatch[1].trim() : code;
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
    }
  };

  if (isLoading) {
    return (
      <div className="relative w-full min-h-[300px] bg-slate-900/80 border border-slate-700 rounded-lg flex items-center justify-center">
        <div className="flex flex-col items-center text-slate-400">
            <Icon name="loader" className="w-8 h-8 animate-spin mb-4" />
            <p className="text-lg font-medium">{loadingText}</p>
            <p className="text-sm">This may take a few moments.</p>
        </div>
      </div>
    );
  }

  if (!code) {
    return null;
  }

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 bg-slate-700/80 rounded-md text-slate-300 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label="Copy code"
      >
        {isCopied ? <Icon name="check" /> : <Icon name="copy" />}
      </button>
      <pre className="w-full min-h-[300px] max-h-[60vh] overflow-auto p-4 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-slate-200 whitespace-pre-wrap break-words">
        <code>{code}</code>
      </pre>
      {isCopied && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              Copied!
          </div>
      )}
    </div>
  );
};
