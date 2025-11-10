# Dobby AI - Transformed UI

A modern AI chat assistant application with a completely transformed green/purple gradient UI theme. The application features real-time chat capabilities, multiple AI models, context management, and Web3 authentication through Privy.

## 🎨 UI Transformation Features

### Color Palette
- **Primary Green**: `#EDFF4D`, `#94FF4D`, `#4DFF5F`
- **Secondary Purple**: `#5F4DFF`, `#FF4DED`
- Enhanced gradients and shadow effects
- Glass morphism design with backdrop blur

### Layout Transformations
- **Header**: Navigation moved to left, logo/title moved to right
- **Chat Interface**: Input area moved to top, header moved to bottom
- **Message Alignment**: User messages on left, AI messages on right (swapped)
- **Element Sizing**: Small elements enlarged, large elements optimized

### Enhanced Components
- Larger, more prominent buttons and interactive elements
- Improved typography with bolder weights and larger fonts
- Custom animations: wiggle, glow, slide-in, fade-in, scale-in
- Enhanced hover effects with scaling and transformations
- Modern gradient scrollbars

## 🚀 Features

### Core Functionality
- **Real-time AI Chat**: Interactive conversations with multiple AI models
- **Model Selection**: Choose from various AI models (GPT-4, Claude, etc.)
- **Context Management**: Organize and switch between different chat contexts
- **Chat History**: Persistent conversation history with search capabilities
- **Share Conversations**: Share chat sessions with others via links

### Authentication & Integration
- **Privy Authentication**: Secure Web3 login with wallet, Twitter, Google
- **User Profiles**: Manage account settings and preferences
- **API Integration**: Full API access for external integrations

### UI/UX Enhancements
- **Theme Toggle**: Light/dark mode with custom styled toggle
- **Responsive Design**: Optimized for desktop and mobile devices
- **Voice Input**: Voice-to-text functionality for hands-free chatting
- **Loading States**: Enhanced loading animations and indicators
- **Error Handling**: Graceful error states and user feedback

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework with TypeScript
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Markdown** - Markdown rendering with syntax highlighting

### Authentication & Web3
- **Privy** - Web3 authentication and wallet management
- **Wallet Connect** - Multi-wallet support

### APIs & Services
- **ROMA API** - Custom task and project management system
- **OpenAI API** - AI model integration
- **Claude API** - Additional AI model support

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dobby-ai-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   SERVER_URL="http://localhost:3001"
   VITE_API_URL="http://localhost:3001"
   VITE_PRIVY_APP_ID="your_privy_app_id"
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Environment Variables
- `SERVER_URL` - Backend server URL
- `VITE_API_URL` - API base URL for client-side requests
- `VITE_PRIVY_APP_ID` - Privy authentication application ID

### Backend Setup
The application requires a backend server running on port 3001. Refer to the ROMA API documentation for backend configuration.

## 🎯 Usage

### Getting Started
1. Open the application in your browser (default: `http://localhost:5173`)
2. Click "Login" to authenticate with Privy
3. Choose your preferred login method (wallet, Twitter, Google)
4. Start chatting with Dobby AI!

### Features Guide

#### Chat Interface
- **Send Messages**: Type in the input field at the top and press Enter or click Send
- **Model Selection**: Choose different AI models from the dropdown menu
- **Context Switching**: Use the Chat History button to manage conversations
- **Share Conversations**: Click the Share Chat button to generate a shareable link

#### Navigation
- **Chat**: Main AI chat interface
- **Models**: View and configure available AI models
- **ROMA**: Access task and project management features
- **Profile**: Manage your account settings

#### Theme Customization
- Use the theme toggle in the header to switch between light and dark modes
- The transformed UI features custom green/purple gradients in both themes

## 🎨 Design System

### Color Palette
```css
/* Primary Greens */
--primary-50: #f9ffeb;
--primary-400: #bdff4d;
--primary-500: #a3ff00;
--primary-900: #4d9400;

/* Secondary Purples */
--secondary-50: #faf0ff;
--secondary-400: #d075ff;
--secondary-500: #bd4dff;
--secondary-900: #5f00cc;
```

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Headings**: Font-black with gradient effects
- **Body Text**: Font-medium with enhanced readability

### Animations
- **Hover Effects**: Scale transformations and color transitions
- **Loading States**: Custom pulse and bounce animations
- **Micro-interactions**: Wiggle, glow, and slide-in effects

## 🔌 API Integration

### Chat API
```typescript
// Send a message
POST /api/chat
{
  "message": "Hello, Dobby!",
  "model": "gpt-4",
  "contextId": "optional-context-id"
}
```

### Context Management
```typescript
// Get chat history
GET /api/contexts

// Create new context
POST /api/contexts/new

// Load specific context
GET /api/contexts/:id
```

## 🐛 Troubleshooting

### Common Issues

#### Development Server Won't Start
- Ensure all dependencies are installed: `npm install`
- Check if port 5173 is available
- Verify Node.js version is 18+

#### Authentication Issues
- Verify `VITE_PRIVY_APP_ID` is correctly set in `.env`
- Check Privy app configuration in the dashboard
- Ensure CORS settings allow your domain

#### Styling Issues
- Clear browser cache and restart dev server
- Verify Tailwind CSS build is successful
- Check for CSS syntax errors in browser console

### TypeScript Errors
- Run `npm run type-check` to identify type issues
- Ensure `tsconfig.json` is properly configured
- Check for missing type definitions

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m "Add feature description"`
5. Push to branch: `git push origin feature-name`
6. Submit a pull request

### Code Style
- Use TypeScript for all new code
- Follow Tailwind CSS utility-first approach
- Maintain the transformed green/purple color scheme
- Ensure responsive design principles

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Privy** - Web3 authentication infrastructure
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **React** - UI framework and ecosystem

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the ROMA API documentation
- Review the troubleshooting section above

---

**Dobby AI** - Your transformed, intelligent chat assistant with a vibrant green/purple UI! 🚀
