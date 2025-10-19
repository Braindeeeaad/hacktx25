import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EmailContextType {
  email: string | null;
  setEmail: (email: string | null) => void;
  clearEmail: () => void;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

interface EmailProviderProps {
  children: ReactNode;
}

export const EmailProvider: React.FC<EmailProviderProps> = ({ children }) => {
  const [email, setEmail] = useState<string | null>(null);

  const clearEmail = () => {
    setEmail(null);
  };

  const value: EmailContextType = {
    email,
    setEmail,
    clearEmail,
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = (): EmailContextType => {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
};
