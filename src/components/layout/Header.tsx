
import { useState } from 'react';
import MainNavigation from './MainNavigation';

export const Header = () => {
  return (
    <header className="border-b bg-background">
      <MainNavigation />
    </header>
  );
};
