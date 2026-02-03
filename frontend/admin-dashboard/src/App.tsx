import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Institutions from './pages/Institutions';
import Courses from './pages/Courses';
import Scholarships from './pages/Scholarships';
import AIAdvisor from './pages/AIAdvisor';
import Analytics from './pages/Analytics';
import Students from './pages/Students';
import Settings from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';
import {
  SignedIn,
  SignedOut,
  SignIn,
  UserButton,
  useAuth
} from '@clerk/clerk-react';
import { OpenAPI } from './types/core/OpenAPI';

// Layout Component for Admin Pages
const AdminLayout: React.FC = () => {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 260,
        breakpoint: 'md',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Header opened={opened} toggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Sidebar closeMobile={toggle} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};

const App: React.FC = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    OpenAPI.TOKEN = async () => {
      const token = await getToken();
      return token || '';
    };
  }, [getToken]);

  return (
    <ThemeProvider>
      {/* Clerk Auth Routing */}
      <SignedOut>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 48, background: 'var(--mantine-color-body)' }}>
          <div style={{ minWidth: 380, maxWidth: 420 }}>
            <SignIn
              appearance={{
                variables: {
                  colorPrimary: '#228be6',
                  colorText: '#fff',
                  colorBackground: '#181c2a',
                  colorInputBackground: '#23283b',
                  colorInputText: '#fff',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                },
                layout: {
                  logoImageUrl: '/logo192.png',
                  termsPageUrl: '/terms',
                  privacyPageUrl: '/privacy',
                  helpPageUrl: '/help',
                  socialButtonsPlacement: 'bottom',
                  socialButtonsVariant: 'iconButton',
                },
              }}
              routing="hash"
              signUpUrl="/sign-up"
            />
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <HashRouter>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="institutions" element={<Institutions />} />
              <Route path="courses" element={<Courses />} />
              <Route path="scholarships" element={<Scholarships />} />
              <Route path="ai-advisor" element={<AIAdvisor />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="students" element={<Students />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </HashRouter>
        <div style={{ position: 'fixed', top: 16, right: 16 }}>
          <UserButton />
        </div>
      </SignedIn>
    </ThemeProvider>
  );
};

export default App;