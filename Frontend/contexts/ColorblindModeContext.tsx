'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface ColorblindModeContextType {
    isColorblindMode: boolean;
    toggleColorblindMode: () => void;
}

const ColorblindModeContext = createContext<ColorblindModeContextType | undefined>(undefined);

export function ColorblindModeProvider({ children }: { children: ReactNode }) {
    const [isColorblindMode, setIsColorblindMode] = useState(false);

    const toggleColorblindMode = () => {
        setIsColorblindMode(prev => !prev);
    };

    return (
        <ColorblindModeContext.Provider value={{ isColorblindMode, toggleColorblindMode }}>
            {children}
        </ColorblindModeContext.Provider>
    );
}

export function useColorblindMode() {
    const context = useContext(ColorblindModeContext);
    if (context === undefined) {
        throw new Error('useColorblindMode debe ser usado dentro de ColorblindModeProvider');
    }
    return context;
}
