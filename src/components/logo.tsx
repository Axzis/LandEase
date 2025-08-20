import Link from 'next/link';
import { Rocket } from 'lucide-react';

export function Logo({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-2 text-xl font-bold text-foreground ${className}`}>
      <Rocket className="w-6 h-6 text-primary" />
      <span>LandEase</span>
    </Link>
  );
}
