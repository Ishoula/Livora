import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';

type Theme = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    text: string;
    textMuted: string;
    primary: string;
    danger: string;
  };
};

const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const resolvedMode: 'light' | 'dark' = useMemo(() => {
    if (mode === 'system') return system === 'dark' ? 'dark' : 'light';
    return mode;
  }, [mode, system]);

  const colors = useMemo(() => {
    if (resolvedMode === 'dark') {
      return {
        background: '#0b1220',
        surface: '#101a2e',
        surfaceMuted: '#1f2937',
        text: '#e5e7eb',
        textMuted: '#9ca3af',
        primary: '#60a5fa',
        danger: '#ef4444'
      };
    }

    return {
      background: '#fff',
      surface: '#fff',
      surfaceMuted: '#f0f0f0',
      text: '#001a2d',
      textMuted: '#666',
      primary: '#001a2d',
      danger: '#b91c1c'
    };
  }, [resolvedMode]);

  const value = useMemo(
    () => ({ mode, setMode, resolvedMode, colors }),
    [mode, resolvedMode, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): Theme => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
