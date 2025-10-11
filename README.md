# 🎯 Personal Insurance Coverage Coach

An AI-powered insurance research assistant that helps users find optimal insurance coverage through intelligent conversations, policy analysis, and personalized recommendations.

## ✨ Features

### 🤖 AI-Powered Chat Interface
- Natural language conversations about insurance needs
- Real-time profile updates from conversations
- Context-aware recommendations
- Multi-line of business support (Auto, Home, Life, Health)

### 📱 Mobile Policy Scanner
- Camera-based document capture
- GPT-4o Vision for text extraction
- Automatic policy data parsing
- Mobile-optimized interface

### 📊 Quote Comparison
- Multi-carrier quote generation
- Side-by-side comparisons
- Summary view for all lines of business
- Detailed feature breakdowns

### 🔍 Coverage Analysis
- PDF and image policy upload
- Gap analysis and recommendations
- Coverage adequacy assessment
- Personalized improvement suggestions

### 💾 Smart Profile Management
- Real-time profile updates
- Local storage persistence
- Export/import functionality
- Profile completeness tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Vectorize.io account (optional, for knowledge base)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/v0-insurance-assistant.git
cd v0-insurance-assistant

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

Create a `.env.local` file with:

```env
OPENAI_API_KEY=your_openai_api_key_here
VECTORIZE_IO_API_KEY=your_vectorize_api_key_here
VECTORIZE_IO_PIPELINE_ID=your_pipeline_id_here
```

## 📱 Mobile Testing

Access from your phone on the same WiFi network:

```
http://YOUR_COMPUTER_IP:3000
```

Find your IP:
- Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig`
- Linux: `ip addr show`

## 🏗️ Project Structure

```
v0-insurance-assistant/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/         # Chat endpoint
│   │   ├── analyze-coverage/
│   │   ├── extract-text/  # Policy text extraction
│   │   └── parse-pdf/     # PDF parsing
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── chat-interface.tsx
│   ├── policy-scanner.tsx
│   ├── quote-results.tsx
│   ├── coverage-analyzer.tsx
│   └── ui/               # UI components
├── lib/                   # Utilities and helpers
│   ├── customer-profile.ts
│   ├── insurance-comparison-generator.ts
│   └── text-extraction.ts
├── mcp-server/           # MCP server for knowledge base
│   ├── index.js          # Main MCP server
│   └── extract-text-from-image.js
└── vectorize-data/       # Insurance knowledge base data
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **AI**: OpenAI GPT-4o
- **Knowledge Base**: Vectorize.io
- **State Management**: React Hooks + Local Storage

## 🎨 Key Components

### Chat Interface
Natural language interface for insurance consultations with real-time profile updates.

### Policy Scanner
Mobile-optimized camera interface using GPT-4o Vision for policy document extraction.

### Quote Comparison
Multi-carrier comparison system with summary and detailed views.

### Coverage Analyzer
Upload existing policies for gap analysis and improvement recommendations.

## 🔧 Development

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Profile creation and editing
- [ ] Chat interface interactions
- [ ] Policy scanner (mobile camera)
- [ ] Quote generation
- [ ] Coverage analyzer
- [ ] Profile persistence
- [ ] Mobile responsiveness

### Mobile Testing
Test camera functionality on actual mobile devices for best results.

## 📊 MCP Server

The Model Context Protocol (MCP) server provides:
- Insurance knowledge base queries
- Policy text extraction
- Coverage explanations
- State-specific requirements

See [mcp-server/README.md](./mcp-server/README.md) for details.

## 🔒 Security

- API keys stored as environment variables
- No sensitive data in client-side code
- HTTPS enforced in production
- Input validation on all forms
- Rate limiting on API routes

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [v0.dev](https://v0.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Powered by [OpenAI](https://openai.com)
- Knowledge base by [Vectorize.io](https://vectorize.io)

## 📞 Support

- 📧 Email: support@example.com
- 💬 Discord: [Join our community](#)
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/v0-insurance-assistant/issues)

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Voice interface
- [ ] Advanced analytics dashboard
- [ ] Integration with insurance carriers
- [ ] Agent portal
- [ ] Mobile apps (iOS/Android)

---

Built with ❤️ using Next.js and AI
