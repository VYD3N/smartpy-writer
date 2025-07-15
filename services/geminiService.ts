
import { GoogleGenAI, Type } from "@google/genai";

const model = 'gemini-2.5-flash';

const getApiKey = (): string => {
    const env = (import.meta as any).env;
    console.log("Full environment object:", env);
    console.log("All environment keys:", Object.keys(env));
    console.log("Looking for VITE_GEMINI_API_KEY");
    console.log("Direct access:", env.VITE_GEMINI_API_KEY);
    console.log("With bracket notation:", env['VITE_GEMINI_API_KEY']);
    
    const apiKey = env?.VITE_GEMINI_API_KEY;
    console.log("API Key found:", !!apiKey);
    console.log("API Key value (first 10 chars):", apiKey ? apiKey.substring(0, 10) + "..." : "undefined");
    
    if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY environment variable not set");
    }
    return apiKey;
};

const getAI = () => {
    return new GoogleGenAI({ apiKey: getApiKey() });
};

type IdeVersion = 'regular' | 'legacy';

export interface DebugResult {
  explanation: string;
  correctedCode: string;
}

const buildGenerationPrompt = (description: string, ideVersion: IdeVersion): string => {
  const ideSpecificInstruction = ideVersion === 'legacy'
    ? 'The contract should be compatible with the SmartPy legacy IDE (e.g., using `sp.TAddress` instead of `sp.address`, and `sp.set_type_expr` for complex types).'
    : 'The contract should be compatible with the modern SmartPy IDE (e.g., using `sp.address`).';

  return `
Generate a SmartPy contract. Description: ${description}

${ideSpecificInstruction}

Your response MUST be a single, valid Python code block representing the SmartPy contract.
- Include necessary imports (sp, sp.utils, sp.io).
- Define the contract storage with appropriate initial values.
- Implement all specified entry points with their logic.
- Infer appropriate input parameters and their types from the description.
- If the description implies roles like an 'administrator', set it in the storage during initialization (e.g., self.data.administrator = sp.sender).
- Use sp.failwith for basic error conditions (e.g., unauthorized access, insufficient balance).
- Include a simple test scenario using @sp.add_test that demonstrates the core functionality.
- Do NOT include any explanations, markdown formatting like \`\`\`python or \`\`\`, or any text other than the Python code itself. The output should be ready to be saved directly into a .py file.
  `.trim();
};

export const generateContractCode = async (description: string, ideVersion: IdeVersion): Promise<string> => {
  try {
    const prompt = buildGenerationPrompt(description, ideVersion);

    const response = await getAI().models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
      }
    });

    let code = response.text?.trim() || '';
    
    // Clean up potential markdown fences if the model adds them
    if (code.startsWith('```python')) {
        code = code.substring(9, code.length - 3).trim();
    } else if (code.startsWith('```')) {
        code = code.substring(3, code.length - 3).trim();
    }

    if (!code.startsWith('import smartpy as sp')) {
        console.warn("Generated code might be malformed. Raw response:", response.text);
    }

    return code;

  } catch (error) {
    console.error("Error generating contract code:", error);
    if (error instanceof Error && error.message.includes('API_KEY')) {
        throw new Error("The API key is invalid or missing. Please check your configuration.");
    }
    throw new Error("Failed to generate contract from AI service. The service may be busy.");
  }
};


const buildDebugPrompt = (contractCode: string, errorMessage: string, ideVersion: IdeVersion): string => {
    const ideContext = ideVersion === 'legacy' 
      ? "The user is working with the legacy SmartPy IDE."
      : "The user is working with the modern SmartPy IDE.";
      
    return `
You are an expert SmartPy developer and debugger. A user has provided a SmartPy contract that is failing.
${ideContext}

Your task is to analyze the contract code and the accompanying error message.
1.  Provide a clear, concise explanation of what is causing the error. Explain the concept behind the error if necessary.
2.  Provide the fully corrected SmartPy contract code.

**User's Erroneous Code:**
\`\`\`python
${contractCode}
\`\`\`

**Error Message Received:**
\`\`\`
${errorMessage}
\`\`\`

Respond with a JSON object that follows the specified schema.
  `.trim();
};
  
export const debugContractCode = async (contractCode: string, errorMessage: string, ideVersion: IdeVersion): Promise<DebugResult> => {
    try {
        const prompt = buildDebugPrompt(contractCode, errorMessage, ideVersion);

        const response = await getAI().models.generateContent({
            model: model,
            contents: prompt,
            config: {
              temperature: 0.3,
              topP: 0.9,
              topK: 40,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  explanation: {
                    type: Type.STRING,
                    description: "A clear, concise explanation of the error, what causes it, and how to fix it. This should be formatted in Markdown."
                  },
                  correctedCode: {
                    type: Type.STRING,
                    description: "The complete, corrected SmartPy contract code, including imports and tests."
                  }
                },
                required: ["explanation", "correctedCode"]
              }
            }
        });

        const jsonString = response.text?.trim() || '{}';
        const result: DebugResult = JSON.parse(jsonString);
        return result;
        
    } catch (error) {
        console.error("Error debugging contract code:", error);
        if (error instanceof Error) {
            if (error.message.includes('API_KEY')) {
                throw new Error("The API key is invalid or missing. Please check your configuration.");
            }
            if (error instanceof SyntaxError) { // JSON parsing error
                throw new Error("The AI service returned an invalid format. Please try again.");
            }
        }
        throw new Error("Failed to debug contract from AI service. The service may be busy.");
    }
};
