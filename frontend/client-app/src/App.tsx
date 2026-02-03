import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/layout/Navbar/Navbar';
import ChatWidget from './features/chat/components/ChatWidget/ChatWidget';
import Home from './pages/HomePage';
import InstitutionsPage from './features/institutions/pages/InstitutionsPage';
import InstitutionDetail from './features/institutions/components/InstitutionDetail/InstitutionDetail';
import CoursesPage from './features/courses/pages/CoursesPage';
import CourseDetail from './features/courses/components/CourseDetail/CourseDetail';
import ScholarshipsPage from './features/scholarships/pages/Scholarships';
import Tools from './pages/ToolsPage';
import Blog from './pages/BlogPage';
import FAQ from './pages/FAQPage';
import About from './pages/AboutPage';
import Contact from './pages/ContactPage';
import Profile from './features/user-profile/pages/Profile';
import Settings from './features/user-profile/pages/Settings';
import Dashboard from './features/dashboard/pages/Dashboard';
import AIChat from './features/chat/pages/AIChat';
import Loans from './features/loans/Loans';
import { useAuth0 } from '@auth0/auth0-react';
import { ScrollToTop, ForceHome, ScrollObserver } from './components/layout/ScrollUtils';
import MainLayout from './components/layout/MainLayout';
import Footer from './components/layout/Footer';
import { OpenAPI } from './types';

const CourseDetailRoute = () => {
  const { id } = useParams();
  return <CourseDetail key={id || 'course'} />;
};



const App = () => {
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect: login,
    user,
  } = useAuth0();

  // Keep a lightweight registry of logged-in students so Admin can show them.
  // NOTE: This is browser localStorage (per-origin). If admin and client are on different domains/ports,
  // they won't share this data.
  useEffect(() => {
    if (!isAuthenticated) return;
    const email = (user as any)?.email;
    if (typeof email !== 'string' || !email.trim()) return;

    try {
      const raw = localStorage.getItem('eduPath_registry');
      const current = raw ? JSON.parse(raw) : [];
      const users = Array.isArray(current) ? current : [];

      let studentDetails: any = undefined;
      try {
        const profileRaw = localStorage.getItem('eduPath_profile_student_details');
        if (profileRaw) studentDetails = JSON.parse(profileRaw);
      } catch {
        // ignore
      }

      const nextUser = {
        ...users.find((u: any) => u?.email === email),
        name: (user as any)?.name || email,
        email,
        avatarUrl: (user as any)?.picture,
        provider: 'auth0',
        ...(studentDetails ? { studentDetails } : {}),
      };

      const next = [
        nextUser,
        ...users.filter((u: any) => u?.email !== email),
      ];

      localStorage.setItem('eduPath_registry', JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [isAuthenticated, user]);


  OpenAPI.BASE = (window as any).config.BASE_API_URL;

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently()
        .then(token => {
          OpenAPI.TOKEN = token;
        })
        .catch(() => {
          OpenAPI.TOKEN = undefined;
        });
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !error) {
      login();
    }
  }, [isLoading, isAuthenticated, error, login]);

  if (isLoading) return "Loading...";

  if (error) {
    const auth0ErrorCode = (error as any)?.error;
    if (auth0ErrorCode === 'rate_limit') {
      return (
        <div style={{ padding: 32, textAlign: 'center', color: 'red' }}>
          <h2>Too Many Requests</h2>
          <p>You have hit the Auth0 rate limit. Please wait a few minutes and try again.</p>
        </div>
      );
    }
    return (
      <div style={{ padding: 32, textAlign: 'center', color: 'red' }}>
        <h2>Authentication Error</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <ForceHome />
        <ScrollObserver />
        <div className="flex flex-col min-h-screen font-sans bg-white text-slate-900 dark:bg-slate-950 transition-colors duration-300 selection:bg-blue-600/10 selection:text-blue-900">
          <Navbar />
          <MainLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/institutions" element={<InstitutionsPage />} />
              <Route path="/institutions/:id" element={<InstitutionDetail />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<CourseDetailRoute />} />
              <Route path="/scholarships" element={<ScholarshipsPage />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<Blog />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/chat" element={<AIChat />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
          <Footer />
          <ChatWidget />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;