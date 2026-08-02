import { LoginForm } from '@/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <LoginForm />
    </main>
  );
}