
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CodeBlock } from './components/CodeBlock';
import { Icon } from './components/Icon';
import { generateContractCode, debugContractCode, DebugResult } from './services/geminiService';

type IdeVersion = 'regular' | 'legacy';
type ActiveTab = 'generator' | 'debugger';

const App: React.FC = () => {
  // Shared State
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');
  const [ideVersion, setIdeVersion] = useState<IdeVersion>('regular');
  
  // Generator State
  const [description, setDescription] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  // Debugger State
  const [contractToDebug, setContractToDebug] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [debugExplanation, setDebugExplanation] = useState<string | null>(null);
  const [correctedCode, setCorrectedCode] = useState<string | null>(null);
  const [isDebugging, setIsDebugging] = useState<boolean>(false);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [isDebuggerCodeCopied, setIsDebuggerCodeCopied] = useState(false);


  const isLoading = isGenerating || isDebugging;

  useEffect(() => {
    if (isDebuggerCodeCopied) {
      const timer = setTimeout(() => setIsDebuggerCodeCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isDebuggerCodeCopied]);

  const handleCopyDebugCode = useCallback(() => {
    if (contractToDebug) {
        navigator.clipboard.writeText(contractToDebug);
        setIsDebuggerCodeCopied(true);
    }
  }, [contractToDebug]);

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) {
      setGeneratorError('Please enter a description for the contract.');
      return;
    }
    setIsGenerating(true);
    setGeneratorError(null);
    setGeneratedCode('');
    try {
      const code = await generateContractCode(description, ideVersion);
      setGeneratedCode(code);
    } catch (err) {
      setGeneratorError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGenerating(false);
    }
  }, [description, ideVersion]);

  const handleDebug = useCallback(async () => {
    if (!contractToDebug.trim() || !errorMessage.trim()) {
        setDebugError('Please provide both the contract code and the error message.');
        return;
    }
    setIsDebugging(true);
    setDebugError(null);
    setDebugExplanation(null);
    setCorrectedCode(null);
    try {
        const result: DebugResult = await debugContractCode(contractToDebug, errorMessage, ideVersion);
        setDebugExplanation(result.explanation);
        setCorrectedCode(result.correctedCode);
    } catch (err) {
        setDebugError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsDebugging(false);
    }
  }, [contractToDebug, errorMessage, ideVersion]);

  const handleApplyCorrection = useCallback(() => {
    if (correctedCode) {
      setContractToDebug(correctedCode);
      setDebugExplanation(null);
      setCorrectedCode(null);
    }
  }, [correctedCode]);

  const TabButton = ({ tab, children }: { tab: ActiveTab; children: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-bold rounded-md transition-colors duration-300 ${activeTab === tab ? 'bg-teal-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
    >
      {children}
    </button>
  );

  const IdeToggle = () => (
    <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-lg">
        <button onClick={() => setIdeVersion('regular')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${ideVersion === 'regular' ? 'bg-teal-500 text-white shadow' : 'text-slate-400 hover:bg-slate-700'}`}>
            Modern IDE
        </button>
        <button onClick={() => setIdeVersion('legacy')} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${ideVersion === 'legacy' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:bg-slate-700'}`}>
            Legacy IDE
        </button>
    </div>
  );


  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/40 via-slate-900 to-purple-900/30 z-0"></div>
      <div className="relative z-10 flex flex-col flex-grow">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8">
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-2 p-1 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg">
                    <TabButton tab="generator"><Icon name="sparkles" className="w-4 h-4 inline mr-1.5"/>Generator</TabButton>
                    <TabButton tab="debugger"><Icon name="debug" className="w-4 h-4 inline mr-1.5"/>Debugger</TabButton>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg">
                  <IdeToggle/>
                </div>
            </div>

            {activeTab === 'generator' && (
              <>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl shadow-slate-950/50">
                  <div className="p-6">
                    <label htmlFor="description" className="block text-lg font-semibold text-slate-300 mb-3">
                      1. Describe Your SmartPy Contract
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => { setDescription(e.target.value); if(generatorError) setGeneratorError(null); }}
                      className="w-full h-40 p-4 bg-slate-900/80 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 resize-y placeholder-slate-500 text-slate-200"
                      placeholder="e.g., A fungible token contract with mint and transfer functionality. Only the admin can mint new tokens."
                      disabled={isLoading}
                    />
                  </div>
                  <div className="px-6 pb-6 text-center">
                    <button
                      onClick={handleGenerate}
                      disabled={isLoading || !description.trim()}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-500/50"
                    >
                      {isGenerating ? (<><Icon name="loader" className="animate-spin mr-3" />Generating...</>) : (<><Icon name="sparkles" className="mr-3" />Generate Contract</>)}
                    </button>
                  </div>
                </div>

                {generatorError && (<div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{generatorError}</span></div>)}
                
                {(generatedCode || isGenerating) && (
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl shadow-slate-950/50">
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-slate-300 mb-3">2. Generated SmartPy Code</h2>
                      <CodeBlock code={generatedCode} isLoading={isGenerating} />
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'debugger' && (
                <>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl shadow-slate-950/50">
                        <div className="p-6 space-y-6">
                            <div>
                                <label htmlFor="contractToDebug" className="block text-lg font-semibold text-slate-300 mb-3">1. Paste Your Code</label>
                                <div className="relative group">
                                    <textarea id="contractToDebug" value={contractToDebug} onChange={(e) => { setContractToDebug(e.target.value); if(debugError) setDebugError(null); }} className="w-full h-48 p-4 font-mono text-sm bg-slate-900/80 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 resize-y placeholder-slate-500 text-slate-200" placeholder="import smartpy as sp ..." disabled={isLoading} />
                                    <button onClick={handleCopyDebugCode} className="absolute top-3 right-3 p-2 bg-slate-700/80 rounded-md text-slate-300 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-label="Copy code">
                                        {isDebuggerCodeCopied ? <Icon name="check" /> : <Icon name="copy" />}
                                    </button>
                                    {isDebuggerCodeCopied && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">Copied!</div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="errorMessage" className="block text-lg font-semibold text-slate-300 mb-3">2. Paste Error Message</label>
                                <textarea id="errorMessage" value={errorMessage} onChange={(e) => { setErrorMessage(e.target.value); if(debugError) setDebugError(null); }} className="w-full h-24 p-4 font-mono text-sm bg-slate-900/80 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 resize-y placeholder-slate-500 text-slate-200" placeholder="SyntaxError: ..." disabled={isLoading} />
                            </div>
                        </div>
                        <div className="px-6 pb-6 text-center">
                            <button onClick={handleDebug} disabled={isLoading || !contractToDebug.trim() || !errorMessage.trim()} className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/50">
                                {isDebugging ? (<><Icon name="loader" className="animate-spin mr-3" />Analyzing...</>) : (<><Icon name="debug" className="mr-3" />Analyze Error</>)}
                            </button>
                        </div>
                    </div>
                    {debugError && (<div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{debugError}</span></div>)}
                    
                    {isDebugging && (
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl shadow-slate-950/50">
                            <div className="relative w-full min-h-[150px] bg-slate-900/80 rounded-lg flex items-center justify-center p-6">
                                <div className="flex flex-col items-center text-slate-400">
                                    <Icon name="loader" className="w-8 h-8 animate-spin mb-4" />
                                    <p className="text-lg font-medium">Analyzing your contract...</p>
                                    <p className="text-sm">This may take a few moments.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {debugExplanation && correctedCode && !isDebugging && (
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl shadow-slate-950/50">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-slate-300 mb-3">3. Debugging Analysis</h2>
                                <div className="p-4 bg-slate-900/60 border border-slate-600 rounded-lg space-y-3 text-slate-300">
                                    <p className="font-semibold text-teal-400">Explanation of the Error:</p>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{debugExplanation}</p>
                                </div>
                                <div className="mt-6 text-center">
                                    <button onClick={handleApplyCorrection} className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-lg hover:bg-teal-500 disabled:bg-slate-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-500/50">
                                        <Icon name="check" className="mr-2 w-5 h-5" />
                                        Apply Correction & Update Code
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default App;
