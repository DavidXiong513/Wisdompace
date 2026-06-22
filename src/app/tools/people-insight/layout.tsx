'use client';

import { ToastProvider } from '@/knowpeople/components/ui/Toast';
import BottomNav from '@/knowpeople/components/BottomNav';

export default function Chapter3Layout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="[--nav-height:64px]">
        {children}
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
