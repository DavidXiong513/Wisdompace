import { Suspense } from 'react';
import { ResetPasswordForm } from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <span className="text-sm text-muted">加载中…</span>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
