import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background grid-texture flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-serif italic">
          <span className="text-accent">Vault</span>
          <span className="text-text-primary font-mono not-italic">IQ</span>
        </h1>
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
