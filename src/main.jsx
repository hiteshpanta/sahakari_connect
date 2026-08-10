import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { Toaster } from 'react-hot-toast';
import { Provider } from 'react-redux';
import { store } from './store/store.js';
import AuthLoader from './store/AuthLoader.jsx';
import RealtimeBridge from './components/RealtimeBridge.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthLoader>
          <App />
          <RealtimeBridge />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card, #0f172a)',
                color: 'var(--text-primary, #f1f5f9)',
                border: '1px solid var(--border-color, #1e293b)',
                fontSize: '14px',
                borderRadius: '10px'
              }
            }}
          />
        </AuthLoader>
      </ThemeProvider>
    </QueryClientProvider>
  </Provider>
);
