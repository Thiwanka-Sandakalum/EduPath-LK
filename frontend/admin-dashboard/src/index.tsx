import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

// Define your theme configuration
const theme = createTheme({
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  primaryColor: 'blue',
  defaultRadius: 'md',
  components: {
    Card: {
      defaultProps: {
        withBorder: true,
        shadow: 'sm',
      }
    }
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: '#228be6', // Mantine blue
          colorText: '#fff',
          colorBackground: '#181c2a',
          colorInputBackground: '#23283b',
          colorInputText: '#fff',
          colorInputBorder: '#228be6',
          fontFamily: 'Plus Jakarta Sans, sans-serif',
        },
        layout: {
          logoImageUrl: '/logo192.png', // update with your logo path if needed
          termsPageUrl: '/terms',
          privacyPageUrl: '/privacy',
          helpPageUrl: '/help',
          socialButtonsPlacement: 'bottom',
          socialButtonsVariant: 'iconButton',
        },
      }}
    >
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <App />
      </MantineProvider>
    </ClerkProvider>
  </React.StrictMode>
);