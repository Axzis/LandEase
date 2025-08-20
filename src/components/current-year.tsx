'use client';

import { useState, useEffect } from 'react';

export function CurrentYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // Render the server-side generated year first, then update on client mount
  // This ensures the initial render is always consistent.
  return <>{year || new Date().getFullYear()}</>;
}
