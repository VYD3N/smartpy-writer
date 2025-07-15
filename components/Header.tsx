
import React from 'react';
import { Icon } from './Icon';

export const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 text-center border-b border-slate-700/50">
      <div className="container mx-auto flex items-center justify-center gap-4">
        <Icon name="logo" className="w-10 h-10 text-teal-400" />
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight">
              AI SmartPy Contract Generator
            </h1>
            <p className="text-sm md:text-base text-slate-400">
              Bring your Tezos smart contracts to life with natural language
            </p>
        </div>
      </div>
    </header>
  );
};
