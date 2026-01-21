'use client';

import { createContext, use, useState, ReactNode } from 'react';

interface TopbarContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  pageActions: ReactNode;
  setPageActions: (actions: ReactNode) => void;
}

const TopbarContext = createContext<TopbarContextType | undefined>(undefined);

export const useTopbarContext = () => {
  const context = use(TopbarContext);
  if (!context) {
    throw new Error('useTopbarContext must be used within TopbarProvider');
  }
  return context;
};

export const TopbarProvider = ({ children }: { children: ReactNode }) => {
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [pageActions, setPageActions] = useState<ReactNode>(null);

  return (
    <TopbarContext.Provider
      value={{
        pageTitle,
        setPageTitle,
        pageActions,
        setPageActions,
      }}
    >
      {children}
    </TopbarContext.Provider>
  );
};
