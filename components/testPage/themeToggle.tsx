"use client";
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get current theme from localStorage or system preference
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Determine if dark mode should be on
      const shouldBeDark = savedTheme === 'dark' || 
        (savedTheme === null && systemPrefersDark);
      
      // Update state and DOM
      setIsDark(shouldBeDark);
    }
  }, []);

  const toggleTheme = () => {
    // Toggle the theme
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Update DOM
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 transition-colors duration-300"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={24} className="text-yellow-400" />
      ) : (
        <Moon size={24} className="text-gray-700" />
      )}
    </button>
  );
};

export default ThemeToggle;