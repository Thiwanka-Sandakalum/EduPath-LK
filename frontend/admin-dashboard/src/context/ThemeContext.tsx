import React, { createContext, useContext, ReactNode } from 'react';
import { useMantineColorScheme } from '@mantine/core';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const theme: Theme = colorScheme === 'auto' ? 'dark' : colorScheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme: toggleColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};