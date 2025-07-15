# AI SmartPy Contract Generator & Debugger

An intelligent web application that helps developers create and debug Tezos smart contracts using natural language descriptions. Powered by Google's Gemini AI, this tool streamlines the SmartPy development workflow with two powerful features: contract generation and error debugging.

## 🚀 Features

### Contract Generator
- **Natural Language to Code**: Describe your smart contract in plain English and get fully functional SmartPy code
- **Intelligent Code Generation**: Automatically includes imports, storage initialization, entry points, and test scenarios
- **Role-Based Logic**: Automatically handles administrator roles and access control when specified
- **Ready-to-Deploy**: Generated contracts include proper error handling and basic validation

### Contract Debugger
- **Error Analysis**: Paste your broken SmartPy code and error messages for intelligent debugging
- **Detailed Explanations**: Get clear explanations of what went wrong and why
- **Corrected Code**: Receive fully corrected SmartPy contracts with fixes applied
- **One-Click Apply**: Easily apply corrections and continue debugging

### IDE Compatibility
- **Modern SmartPy IDE**: Full support for current SmartPy syntax and features
- **Legacy SmartPy IDE**: Compatible with legacy SmartPy IDE (legacy.smartpy.io) syntax and conventions
- **Seamless Switching**: Toggle between IDE versions to match your development environment

## 🛠️ Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: TailwindCSS for modern, responsive design
- **Build Tool**: Vite for fast development and building
- **AI Integration**: Google Gemini API for intelligent code generation and debugging
- **Module Loading**: ESM modules via CDN for lightweight deployment

## 📋 Prerequisites

- **Node.js** (version 16 or higher)
- **Google Gemini API Key** (get one from [Google AI Studio](https://aistudio.google.com/))

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/VYD3N/smartpy-writer.git
   cd smartpy-writer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```bash
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to start using the application

## 💡 Usage

### Generating Contracts

1. **Select IDE Version**: Choose between Modern or Legacy SmartPy IDE compatibility
2. **Describe Your Contract**: Enter a natural language description of what you want your contract to do
3. **Generate**: Click "Generate Contract" to get your SmartPy code
4. **Copy & Use**: Copy the generated code directly into your SmartPy IDE

**Example Descriptions:**
- "A fungible token contract with mint and transfer functionality. Only the admin can mint new tokens."
- "A simple voting contract where users can vote for candidates and only the owner can add new candidates."
- "An escrow contract that holds funds until both parties agree to release them."

### Debugging Contracts

1. **Select IDE Version**: Ensure you're using the correct IDE compatibility mode
2. **Paste Your Code**: Copy your broken SmartPy contract into the code area
3. **Add Error Message**: Paste the error message you received from the SmartPy IDE
4. **Analyze**: Click "Analyze Error" to get debugging insights
5. **Apply Fix**: Review the explanation and apply the corrected code

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Your Google Gemini API key for AI functionality | Yes |

### IDE Compatibility Modes

- **Modern IDE**: Uses current SmartPy syntax (e.g., `sp.address`, modern type annotations)
- **Legacy IDE**: Uses legacy SmartPy syntax (e.g., `sp.TAddress`, `sp.set_type_expr`)

## 📁 Project Structure

```
smartpy-writer/
├── components/           # React components
│   ├── CodeBlock.tsx    # Code display and copying
│   ├── Footer.tsx       # Application footer
│   ├── Header.tsx       # Application header
│   └── Icon.tsx         # SVG icon components
├── services/            # External service integrations
│   └── geminiService.ts # Gemini AI API integration
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── index.html          # HTML template
└── vite.config.ts      # Vite configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## ⚠️ Disclaimer

Generated code is for demonstration and educational purposes. Always review and test generated contracts thoroughly before deploying to mainnet. Smart contracts handle valuable assets and should be audited by security professionals.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Related Links

- [SmartPy Documentation](https://smartpy.io/docs/)
- [Legacy SmartPy IDE](https://legacy.smartpy.io/ide)
- [Modern SmartPy IDE](https://smartpy.io/ide)
- [Tezos Developer Portal](https://tezos.com/developers/)
- [Google Gemini API](https://aistudio.google.com/)
