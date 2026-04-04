import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppRouter } from './routes/AppRouter';
import './index.css';
import { config } from './config/env';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={config.googleClientId}>
      <AppRouter />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
