import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Auth0Provider } from '@auth0/auth0-react';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={(window as any).config.AUTH0_DOMAIN}
      clientId={(window as any).config.AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: (window as any).config.AUTH0_REDIRECT_URI }}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
