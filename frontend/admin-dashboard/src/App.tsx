import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppShell, Center, Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Institutions from './pages/Institutions';
import InstitutionCreate from './pages/InstitutionCreate';
import InstitutionDetails from './pages/InstitutionDetails';
import Courses from './pages/Courses';
import CourseCreate from './pages/CourseCreate';
import CourseDetails from './pages/CourseDetails';
import Scholarships from './pages/Scholarships';
import ScholarshipCreate from './pages/ScholarshipCreate';
import Analytics from './pages/Analytics';
import Students from './pages/Students';
import Settings from './pages/Settings';
import { ThemeProvider } from './context/ThemeContext';
import {
  ClerkLoaded,
  ClerkLoading,
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
      <ClerkLoading>
        <Center mih="100vh">
          <Loader size="md" />
        </Center>
      </ClerkLoading>

      {/* Clerk Auth Routing */}
      <ClerkLoaded>
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
                routing="path"
                signUpUrl="/sign-up"
              />
            </div>
          </div>
        </SignedOut>
        <SignedIn>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="institutions" element={<Institutions />} />
                <Route path="institutions/new" element={<InstitutionCreate />} />
                <Route path="institutions/:id" element={<InstitutionDetails />} />
                <Route path="courses" element={<Courses />} />
                <Route path="courses/new" element={<CourseCreate />} />
                <Route path="courses/:id" element={<CourseDetails />} />
                <Route path="scholarships" element={<Scholarships />} />
                <Route path="scholarships/new" element={<ScholarshipCreate />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="students" element={<Students />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
          <div style={{ position: 'fixed', top: 16, right: 16 }}>
            <UserButton />
          </div>
        </SignedIn>
      </ClerkLoaded>
    </ThemeProvider>
  );
};

export default App;