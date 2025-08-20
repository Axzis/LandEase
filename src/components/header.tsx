import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './logo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild className="transition-colors duration-200">
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button asChild className="shadow transition-transform duration-200 hover:scale-105">
              <Link href="/signup">Get Started for Free</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
