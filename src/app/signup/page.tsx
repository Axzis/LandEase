import { AuthForm } from '@/components/auth/auth-form';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <Card className="w-full max-w-md mx-4 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo href="/" />
          </div>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Get started with your free LandEase account today.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
