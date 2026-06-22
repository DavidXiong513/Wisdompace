'use client';

import { ToastProvider } from '@/knowpeople/components/ui/Toast';
import BottomNav from '@/knowpeople/components/BottomNav';
import { usePeopleInsightCloudSync } from '@/knowpeople/hooks/usePeopleInsightCloudSync';

export default function Chapter3Layout({ children }: { children: React.ReactNode }) {
  usePeopleInsightCloudSync();

  return (
    <ToastProvider>
      <div className="[--nav-height:64px]">
        {children}
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
