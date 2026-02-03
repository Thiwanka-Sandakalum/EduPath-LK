import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, createTheme, Card, Center, Code, Stack, Text, Title } from '@mantine/core';
import '@mantine/core/styles.css';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { OpenAPI } from './types/core/OpenAPI';

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error?: Error; info?: { componentStack?: string } }
> {
  state: { error?: Error; info?: { componentStack?: string } } = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    this.setState({ error, info });
  }

  render() {
    if (this.state.error) {
      return (
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Center mih="100vh" p="md">
            <Card radius="md" padding="lg" w={720}>
              <Stack gap="sm">
                <Title order={3}>Admin dashboard crashed</Title>
                <Text c="dimmed" size="sm">
                  A runtime error occurred while rendering the app. This usually happens due to a missing/invalid environment variable or a bad dependency.
                </Text>
                <Text size="sm">Error:</Text>
                <Code block>{String(this.state.error?.message || this.state.error)}</Code>
                <Text size="sm">Environment:</Text>
                <Code block>
                  VITE_CLERK_PUBLISHABLE_KEY: {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'set' : 'missing'}
                  {'\n'}VITE_API_BASE_URL: {import.meta.env.VITE_API_BASE_URL || '(default)'}
                  {'\n'}OpenAPI.BASE: {OpenAPI.BASE || '(empty)'}
                </Code>
                {this.state.info?.componentStack ? (
                  <>
                    <Text size="sm">Component stack:</Text>
                    <Code block>{this.state.info.componentStack}</Code>
                  </>
                ) : null}
                <Text c="dimmed" size="sm">Fix the env/config and restart <Code>npm run dev</Code>.</Text>
              </Stack>
            </Card>
          </Center>
        </MantineProvider>
      );
    }

    return this.props.children;
  }
}

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

// Backend main-service port can vary by environment (.env). Prefer VITE_API_BASE_URL.
// Default to 2000 to match the repo's local backend dev setup.
OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:2000';

const root = ReactDOM.createRoot(rootElement);

if (!PUBLISHABLE_KEY) {
  root.render(
    <React.StrictMode>
      <RootErrorBoundary>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Center mih="100vh" p="md">
            <Card radius="md" padding="lg" w={520}>
              <Stack gap="sm">
                <Title order={3}>Admin dashboard not configured</Title>
                <Text c="dimmed" size="sm">
                  Missing <Code>VITE_CLERK_PUBLISHABLE_KEY</Code>. Without it, Clerk auth can’t load and the UI will appear blank.
                </Text>
                <Text size="sm">
                  Create <Code>frontend/admin-dashboard/.env.local</Code> and add:
                </Text>
                <Code block>
                  VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
                  {'\n'}VITE_API_BASE_URL=http://localhost:2000
                </Code>
                <Text c="dimmed" size="sm">Then restart <Code>npm run dev</Code>.</Text>
              </Stack>
            </Card>
          </Center>
        </MantineProvider>
      </RootErrorBoundary>
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <RootErrorBoundary>
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
      </RootErrorBoundary>
    </React.StrictMode>
  );
}