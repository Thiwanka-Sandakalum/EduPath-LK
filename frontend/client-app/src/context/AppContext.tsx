import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserApplication, UserInquiry, UserProfile, ChatSession } from '../types';
import { Language } from '../data/translations';

// Define Theme Type
export type ThemeColor = 'blue' | 'purple' | 'emerald' | 'rose';

interface RegisteredUser extends UserProfile {
  password?: string; // stored for mock auth
}

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Theme
  theme: ThemeColor;
  setTheme: (theme: ThemeColor) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;

  savedInstitutions: string[];
  toggleSavedInstitution: (id: string) => void;
  applications: UserApplication[];
  addApplication: (app: UserApplication) => void;
  inquiries: UserInquiry[];
  addInquiry: (inquiry: UserInquiry) => void;
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
  
  // Chat
  chatSessions: ChatSession[];
  saveChatSession: (session: ChatSession) => void;
  deleteChatSession: (id: string) => void;
  
  user: UserProfile | null;
  login: (email: string, password?: string) => Promise<boolean>; // Returns success/fail
  googleLogin: (userData: Partial<UserProfile>) => void;
  register: (userData: RegisteredUser) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => void;
  
  registeredUsers: RegisteredUser[];
}

const AppContext = createContext<AppState | undefined>(undefined);

// Theme Definitions (RGB values)
const THEMES: Record<ThemeColor, any> = {
  blue: {
    50: '239 246 255', 100: '219 234 254', 200: '191 219 254', 500: '59 130 246', 600: '37 99 235', 700: '29 78 216'
  },
  purple: {
    50: '250 245 255', 100: '243 232 255', 200: '233 213 255', 500: '168 85 247', 600: '147 51 234', 700: '126 34 206'
  },
  emerald: {
    50: '236 253 245', 100: '209 250 229', 200: '167 243 208', 500: '16 185 129', 600: '5 150 105', 700: '4 120 87'
  },
  rose: {
    50: '255 241 242', 100: '255 228 230', 200: '254 205 211', 500: '244 63 94', 600: '225 29 72', 700: '190 18 60'
  }
};

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  // --- State Initialization ---
  
  const [language, setLanguage] = useState<Language>(() => 
    (localStorage.getItem('eduPath_lang') as Language) || 'en'
  );

  const [theme, setThemeState] = useState<ThemeColor>(() => 
    (localStorage.getItem('eduPath_theme') as ThemeColor) || 'blue'
  );

  const [darkMode, setDarkMode] = useState<boolean>(() => 
    localStorage.getItem('eduPath_dark') === 'true'
  );

  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => {
    const stored = localStorage.getItem('eduPath_registry');
    // Default test user if none exist
    return stored ? JSON.parse(stored) : [{
      name: 'Test Student',
      email: 'user@example.com',
      password: 'password',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
      provider: 'email',
      studentDetails: {
        fullName: 'Test Student',
        mobile: '0771234567',
        dob: '2000-01-01',
        gender: 'Male',
        district: 'Colombo',
        eduLevel: 'A/L',
        schoolName: 'Royal College',
        stream: 'Physical Science',
        subjects: 'Combined Maths, Physics, Chemistry',
        results: 'Z-Score: 1.85',
        completionYear: '2023',
        interestedField: 'Engineering',
        skills: 'Python, Mathematics',
        careerGoals: 'To become a software engineer.',
        preferredCountry: 'Sri Lanka',
        additionalEducation: [
          {
            id: 'edu_1',
            type: 'Diploma',
            courseName: 'Diploma in English',
            institute: 'Aquinas College',
            field: 'Languages',
            startYear: '2021',
            completionYear: '2022',
            mode: 'Part-time',
            hasCertificate: true,
            description: 'Completed with Merit pass.'
          }
        ]
      }
    }];
  });

  const [savedInstitutions, setSavedInstitutions] = useState<string[]>(() => 
    JSON.parse(localStorage.getItem('eduPath_saved') || '[]')
  );
  
  const [applications, setApplications] = useState<UserApplication[]>(() => 
    JSON.parse(localStorage.getItem('eduPath_applications') || '[]')
  );

  const [inquiries, setInquiries] = useState<UserInquiry[]>(() => 
    JSON.parse(localStorage.getItem('eduPath_inquiries') || '[]')
  );

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => 
    JSON.parse(localStorage.getItem('eduPath_recent') || '[]')
  );

  // Load chats from local storage (or default to empty)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const savedChats = localStorage.getItem('eduPath_chats');
    if (savedChats) {
      // Need to revive dates from JSON strings
      const parsed: ChatSession[] = JSON.parse(savedChats);
      return parsed.map(session => ({
        ...session,
        messages: session.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp as string)
        }))
      }));
    }
    return [];
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('eduPath_user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- Persistence Effects ---
  
  useEffect(() => localStorage.setItem('eduPath_lang', language), [language]);
  useEffect(() => localStorage.setItem('eduPath_theme', theme), [theme]);
  useEffect(() => localStorage.setItem('eduPath_dark', String(darkMode)), [darkMode]);
  useEffect(() => localStorage.setItem('eduPath_registry', JSON.stringify(registeredUsers)), [registeredUsers]);
  useEffect(() => localStorage.setItem('eduPath_saved', JSON.stringify(savedInstitutions)), [savedInstitutions]);
  useEffect(() => localStorage.setItem('eduPath_applications', JSON.stringify(applications)), [applications]);
  useEffect(() => localStorage.setItem('eduPath_inquiries', JSON.stringify(inquiries)), [inquiries]);
  useEffect(() => localStorage.setItem('eduPath_recent', JSON.stringify(recentlyViewed)), [recentlyViewed]);
  useEffect(() => localStorage.setItem('eduPath_chats', JSON.stringify(chatSessions)), [chatSessions]);
  useEffect(() => {
    if (user) {
      localStorage.setItem('eduPath_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('eduPath_user');
    }
  }, [user]);

  // Apply Theme CSS Variables
  useEffect(() => {
    const root = document.documentElement;
    const colors = THEMES[theme];
    root.style.setProperty('--color-primary-50', colors[50]);
    root.style.setProperty('--color-primary-100', colors[100]);
    root.style.setProperty('--color-primary-200', colors[200]);
    root.style.setProperty('--color-primary-500', colors[500]);
    root.style.setProperty('--color-primary-600', colors[600]);
    root.style.setProperty('--color-primary-700', colors[700]);
  }, [theme]);

  // Apply Dark Mode Class
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const setTheme = (newTheme: ThemeColor) => {
    setThemeState(newTheme);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // --- Logic ---

  const toggleSavedInstitution = useCallback((id: string) => {
    setSavedInstitutions(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const addApplication = useCallback((app: UserApplication) => {
    setApplications(prev => [...prev, app]);
  }, []);

  const addInquiry = useCallback((inquiry: UserInquiry) => {
    setInquiries(prev => [...prev, inquiry]);
  }, []);

  const addRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewed(prev => {
      if (prev.length > 0 && prev[0] === id) return prev;
      const filtered = prev.filter(item => item !== id);
      return [id, ...filtered].slice(0, 3);
    });
  }, []);

  const saveChatSession = useCallback((session: ChatSession) => {
    setChatSessions(prev => {
      const exists = prev.findIndex(s => s.id === session.id);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = session;
        return updated;
      }
      return [session, ...prev];
    });
  }, []);

  const deleteChatSession = useCallback((id: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const register = useCallback(async (newUser: RegisteredUser) => {
    // Check if email already exists
    if (registeredUsers.some(u => u.email === newUser.email)) {
      return false; // Email taken
    }
    
    // Assign default avatar if none
    const userWithAvatar = {
      ...newUser,
      avatarUrl: newUser.avatarUrl || `https://ui-avatars.com/api/?name=${newUser.name}&background=random`,
      provider: 'email' as const
    };

    setRegisteredUsers(prev => [...prev, userWithAvatar]);
    // Auto login after register
    const { password, ...safeUser } = userWithAvatar;
    setUser(safeUser);
    return true;
  }, [registeredUsers]);

  const login = useCallback(async (email: string, password?: string) => {
    const foundUser = registeredUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...safeUser } = foundUser;
      setUser(safeUser);
      return true;
    }
    return false;
  }, [registeredUsers]);

  const googleLogin = useCallback((userData: Partial<UserProfile>) => {
    // Check if this google user exists in registry by email, if so, log them in
    // If not, register them without a password (social login)
    const existing = registeredUsers.find(u => u.email === userData.email);
    
    if (existing) {
       const { password, ...safeUser } = existing;
       // Ensure provider is set if missing on legacy data
       if (!safeUser.provider) safeUser.provider = 'google';
       setUser(safeUser);
    } else {
       // Register new google user
       const newUser: RegisteredUser = {
         name: userData.name || 'User',
         email: userData.email || '',
         avatarUrl: userData.avatarUrl,
         provider: 'google'
       };
       setRegisteredUsers(prev => [...prev, newUser]);
       setUser(newUser);
    }
  }, [registeredUsers]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateUser = useCallback((data: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      
      // Also update the registry so data persists on next login
      setRegisteredUsers(currentUsers => 
        currentUsers.map(u => u.email === prev.email ? { ...u, ...data } : u)
      );
      
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      language,
      setLanguage,
      theme,
      setTheme,
      darkMode,
      toggleDarkMode,
      savedInstitutions,
      toggleSavedInstitution,
      applications,
      addApplication,
      inquiries,
      addInquiry,
      recentlyViewed,
      addRecentlyViewed,
      chatSessions,
      saveChatSession,
      deleteChatSession,
      user,
      login,
      googleLogin,
      register,
      logout,
      updateUser,
      registeredUsers
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};