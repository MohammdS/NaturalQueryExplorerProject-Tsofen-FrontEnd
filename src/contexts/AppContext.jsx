import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

// Initial state
const initialState = {
  user: null,
  isGuest: false,
  databases: [],
  currentDatabase: null,
  chatMessages: [],
  isLoading: false,
  error: null,
};

// Action types
const ActionTypes = {
  SET_USER: 'SET_USER',
  SET_GUEST: 'SET_GUEST',
  LOGOUT: 'LOGOUT',
  ADD_DATABASE: 'ADD_DATABASE',
  DELETE_DATABASE: 'DELETE_DATABASE',
  SET_CURRENT_DATABASE: 'SET_CURRENT_DATABASE',
  ADD_CHAT_MESSAGE: 'ADD_CHAT_MESSAGE',
  CLEAR_CHAT: 'CLEAR_CHAT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isGuest: false,
        error: null,
      };
    
    case ActionTypes.SET_GUEST:
      return {
        ...state,
        user: null,
        isGuest: true,
        databases: [],
        currentDatabase: null,
        chatMessages: [],
        error: null,
      };
    
    case ActionTypes.LOGOUT:
      return {
        ...initialState,
      };
    
    case ActionTypes.ADD_DATABASE:
      if (state.databases.length >= 5) {
        return {
          ...state,
          error: 'Maximum of 5 databases allowed',
        };
      }
      return {
        ...state,
        databases: [...state.databases, action.payload],
        error: null,
      };
    
    case ActionTypes.DELETE_DATABASE:
      return {
        ...state,
        databases: state.databases.filter(db => db.id !== action.payload),
        currentDatabase: state.currentDatabase?.id === action.payload ? null : state.currentDatabase,
        chatMessages: state.currentDatabase?.id === action.payload ? [] : state.chatMessages,
      };
    
    case ActionTypes.SET_CURRENT_DATABASE:
      return {
        ...state,
        currentDatabase: action.payload,
        chatMessages: [], // Clear chat when switching databases
      };
    
    case ActionTypes.ADD_CHAT_MESSAGE:
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };
    
    case ActionTypes.CLEAR_CHAT:
      return {
        ...state,
        chatMessages: [],
      };
    
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    default:
      return state;
  }
};

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedDatabases = localStorage.getItem('databases');
    
    if (savedUser && !state.isGuest) {
      try {
        const userData = JSON.parse(savedUser);
        dispatch({ type: ActionTypes.SET_USER, payload: userData });
      } catch (error) {
        console.error('Error parsing saved user data:', error);
      }
    }
    
    if (savedDatabases) {
      try {
        const databases = JSON.parse(savedDatabases);
        databases.forEach(db => {
          dispatch({ type: ActionTypes.ADD_DATABASE, payload: db });
        });
      } catch (error) {
        console.error('Error parsing saved databases:', error);
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (state.user && !state.isGuest) {
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('user');
    }
  }, [state.user, state.isGuest]);

  useEffect(() => {
    if (state.databases.length > 0) {
      localStorage.setItem('databases', JSON.stringify(state.databases));
    } else {
      localStorage.removeItem('databases');
    }
  }, [state.databases]);

  // Actions
  const actions = {
    // Authentication
    signIn: (userData) => {
      dispatch({ type: ActionTypes.SET_USER, payload: userData });
    },
    
    signUp: (userData) => {
      dispatch({ type: ActionTypes.SET_USER, payload: userData });
    },
    
    signInAsGuest: () => {
      dispatch({ type: ActionTypes.SET_GUEST });
    },
    
    logout: () => {
      dispatch({ type: ActionTypes.LOGOUT });
    },
    
    // Database management
    addDatabase: (databaseData) => {
      const newDatabase = {
        id: Date.now().toString(),
        ...databaseData,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: ActionTypes.ADD_DATABASE, payload: newDatabase });
      return newDatabase;
    },
    
    deleteDatabase: (databaseId) => {
      dispatch({ type: ActionTypes.DELETE_DATABASE, payload: databaseId });
    },
    
    selectDatabase: (database) => {
      dispatch({ type: ActionTypes.SET_CURRENT_DATABASE, payload: database });
    },
    
    // Chat functionality
    sendMessage: (content) => {
      const userMessage = {
        id: Date.now().toString(),
        content,
        isUser: true,
        timestamp: new Date(),
      };
      
      dispatch({ type: ActionTypes.ADD_CHAT_MESSAGE, payload: userMessage });
      
      // Simulate AI response (placeholder)
      setTimeout(() => {
        const aiResponse = {
          id: (Date.now() + 1).toString(),
          content: `I received your message: "${content}". This is a placeholder response. In a real application, this would connect to your database and provide relevant information.`,
          isUser: false,
          timestamp: new Date(),
        };
        dispatch({ type: ActionTypes.ADD_CHAT_MESSAGE, payload: aiResponse });
      }, 1000);
    },
    
    clearChat: () => {
      dispatch({ type: ActionTypes.CLEAR_CHAT });
    },
    
    // Utility actions
    setLoading: (loading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
    },
    
    setError: (error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    },
    
    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    },
  };

  const value = {
    ...state,
    ...actions,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
