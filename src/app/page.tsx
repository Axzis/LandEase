import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: <CheckCircle className="w-6 h-6 text-primary" />,
    title: 'Intuitive Drag & Drop',
    description: 'Easily build and customize your pages with a simple drag-and-drop interface. No coding required.',
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-primary" />,
    title: 'AI Headline Generator',
    description: 'Stuck on a headline? Let our AI generate compelling, high-converting headlines for you in seconds.',
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-primary" />,
    title: 'Real-Time Preview',
    description: 'See your changes live as you make them. What you see is exactly what you get.',
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-primary" />,
    title: 'Page Management',
    description: 'Create, save, and manage multiple landing pages from a single, easy-to-use dashboard.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <section className="py-20 md:py-32 bg-background text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-6 text-balance">
              Build Stunning Landing Pages, No Code Required.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 text-balance">
              LandEase is a no-code SaaS platform that empowers you to create beautiful, high-converting landing pages with an intuitive drag-and-drop editor.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="transition-transform duration-200 hover:scale-105">
                <Link href="/signup">Get Started for Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="transition-transform duration-200 hover:scale-105">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
        
        <section id="features" className="py-20 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
                Powerful features designed to help you create and launch with ease.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-8 bg-background border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LandEase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
