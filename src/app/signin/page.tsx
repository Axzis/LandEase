import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <Card className="w-full max-w-md mx-4 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo href="/" />
          </div>
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>Sign in to continue to your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signin" />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
