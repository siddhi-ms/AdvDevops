// src/context/ThemeContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Create the Context
const ThemeContext = createContext({
    isDarkMode: false,
    toggleDarkMode: () => {},
});

// 2. Create a custom hook for easy access
export const useTheme = () => useContext(ThemeContext);

// 3. Create the Provider component (wraps your whole App)
export const ThemeProvider = ({ children }) => {
    // Check local storage for saved theme preference or default to false (light)
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Use window.matchMedia for system preference fallback if local storage is empty
        const savedTheme = localStorage.getItem('isDarkMode');
        if (savedTheme !== null) {
            return JSON.parse(savedTheme);
        }
        // Fallback to system preference (optional but recommended)
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Effect to apply the 'dark' class to the HTML root element
    useEffect(() => {
        // 1. Update the 'localStorage' to persist user's choice
        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));

        // 2. Apply or remove the 'dark' class on the <html> element
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};