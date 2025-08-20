import Link from 'next/link';
import { Button } from './ui/button';
import { Logo } from './logo';

export function Header() {
  return (
    <header data-aos="fade-down" className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <div className="ml-auto flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-sm font-medium">
            <Link href="/#features" className="text-muted-foreground transition-colors hover:text-primary">
              Features
            </Link>
            <Link href="/#how-it-works" className="text-muted-foreground transition-colors hover:text-primary">
              How It Works
            </Link>
            <Link href="/#pricing" className="text-muted-foreground transition-colors hover:text-primary">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button asChild className="transition-transform duration-200 hover:scale-105">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
