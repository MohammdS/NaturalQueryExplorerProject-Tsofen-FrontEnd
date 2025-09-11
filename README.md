# Natural Query Explorer - Frontend

A modern React frontend application that allows users to interact with databases using natural language queries. Built with React, Vite, TailwindCSS, and React Router.

## Features

### 🚀 Core Functionality
- **Welcome Page**: Clean landing page with Sign In, Sign Up, and Guest mode options
- **User Authentication**: Sign in/Sign up forms with validation
- **Database Management**: Manage up to 5 databases per user
- **Natural Language Chat**: Interactive chat interface for database queries
- **Guest Mode**: Try the application without creating an account

### 🎨 User Experience
- **Modern UI**: Built with TailwindCSS for a clean, responsive design
- **Smooth Animations**: Subtle transitions and hover effects
- **Mobile Responsive**: Works seamlessly on all device sizes
- **Real-time Chat**: Instant messaging interface with typing indicators

### 🔧 Technical Features
- **State Management**: React Context API for global state
- **Routing**: React Router for seamless navigation
- **Local Storage**: Persistent user data and database storage
- **Form Validation**: Client-side validation with error handling
- **Modular Components**: Reusable UI components

## Tech Stack

- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icon library
- **Radix UI** - Accessible component primitives

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd natural-query-explorer-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   └── ui/           # Reusable UI components
├── contexts/         # React Context providers
├── lib/             # Utility functions
├── pages/           # Page components
├── App.jsx          # Main app component
└── main.jsx         # App entry point
```

## User Flow

1. **Welcome Page** → Choose authentication method
2. **Authentication** → Sign in, Sign up, or continue as guest
3. **Dashboard** → View and manage databases (max 5)
4. **Chat Interface** → Natural language database queries

## Features Overview

### Welcome Page
- Hero section with feature highlights
- Three authentication options
- Responsive design with modern UI

### Authentication
- **Sign In**: Email/password with validation
- **Sign Up**: Full name, email, password confirmation
- **Guest Mode**: Immediate access without account creation

### Dashboard
- Database cards with metadata
- Add new databases (up to 5 total)
- Delete existing databases
- Quick access to chat interface

### Chat Interface
- Real-time messaging
- Message history with timestamps
- Suggested queries for quick start
- Clear chat functionality
- Character counter and input validation

## State Management

The application uses React Context API for state management:

- **User Authentication**: User data and login state
- **Database Management**: CRUD operations for databases
- **Chat Messages**: Message history and real-time updates
- **Error Handling**: Global error state and notifications

## Styling

- **TailwindCSS**: Utility-first CSS framework
- **Custom Design System**: Consistent colors, spacing, and typography
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: CSS custom properties for theming

## Future Enhancements

- JWT authentication with backend integration
- Real database connections
- File upload for database schemas
- Rich text formatting in chat
- Advanced query suggestions
- Export chat conversations
- Multi-language support

## Demo Mode

This is a demo application with the following limitations:
- No real database connections
- Local storage only (data not persisted across devices)
- Simulated API responses
- Guest mode has limited functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.