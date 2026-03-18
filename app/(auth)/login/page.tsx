import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background grid-texture flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <img src="/logo.png" alt="VaultIQ" className="h-16 w-auto mx-auto mb-4" />
        <p className="mt-2 text-text-secondary text-sm">
          Financial Intelligence. Stays Here.
        </p>
      </div>

      {/* Login Form Card */}
      <div className="w-full max-w-md bg-surface border border-border rounded-lg p-8">
        <h2 className="text-xl font-medium text-text-primary mb-6 text-center">
          Sign In
        </h2>
        <LoginForm />
      </div>

      {/* Footer */}
      <p className="mt-8 text-text-tertiary text-xs">
        Internal Tool • Authorized Users Only
      </p>
    </div>
  );
}
