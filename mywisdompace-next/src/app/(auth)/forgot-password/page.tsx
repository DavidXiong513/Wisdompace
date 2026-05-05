import { Suspense } from 'react';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <span className="text-sm text-muted">加载中…</span>
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
