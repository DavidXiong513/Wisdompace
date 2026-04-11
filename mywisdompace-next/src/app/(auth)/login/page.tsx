import { Suspense } from 'react';
import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <span className="text-sm text-muted">加载中…</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
