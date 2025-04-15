'use client';

import { useEffect, useState, Suspense } from 'react';
import Description from '@/components/dashBoard/description';

// Define the ProblemItem type
interface ProblemItem {
  title: string;
  category: string;
}

export default function DescriptionPage() {
  const [data, setData] = useState<null | ProblemItem>(null);

  useEffect(() => {
    const stored = localStorage.getItem('descriptionData');
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Description
        title={data.title}
        category={data.category}
        onBack={() => window.history.back()}
      />
    </Suspense>
  );
}
