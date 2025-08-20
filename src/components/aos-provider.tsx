'use client';

import { useEffect } from 'react';
import AOS from 'aos';

export const AosProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  return <>{children}</>;
};
