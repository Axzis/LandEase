import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, LayoutTemplate, Palette, Rocket, Component as ComponentIcon } from 'lucide-react';
import Link from 'next/link';
import { CurrentYear } from '@/components/current-year';

const features = [
  {
    icon: <LayoutTemplate className="w-8 h-8 text-primary" />,
    title: 'Intuitive Drag & Drop',
    description: 'Easily build and customize your pages with a simple drag-and-drop interface. No coding required.',
  },
  {
    icon: <ComponentIcon className="w-8 h-8 text-primary" />,
    title: 'AI-Powered Content',
    description: 'Stuck on a headline? Let our AI generate compelling, high-converting content for you in seconds.',
  },
  {
    icon: <Eye className="w-8 h-8 text-primary" />,
    title: 'Real-Time Preview',
    description: 'See your changes live as you make them. What you see is exactly what you get.',
  },
];

const howItWorks = [
    {
      step: 1,
      icon: <ComponentIcon className="w-10 h-10 text-primary" />,
      title: 'Select Components',
      description: 'Choose from a library of professionally designed, ready-to-use components to start building your page.'
    },
    {
      step: 2,
      icon: <Palette className="w-10 h-10 text-primary" />,
      title: 'Customize Your Design',
      description: 'Drag, drop, and style your page with our intuitive editor. Match your brand with just a few clicks.'
    },
    {
      step: 3,
      icon: <Rocket className="w-10 h-10 text-primary" />,
      title: 'Publish & Go Live',
      description: 'Launch your stunning, high-performance landing page to the world with a single click.'
    }
]

const pricingPlans = [
  {
    title: 'Hobby',
    price: '$0',
    frequency: '/ month',
    description: 'For personal projects and getting started.',
    features: ['1 Landing Page', 'Core Components', 'Community Support'],
    cta: 'Start for Free',
    href: '/signup',
    popular: false,
  },
  {
    title: 'Pro',
    price: '$19',
    frequency: '/ month',
    description: 'For professionals and small businesses.',
    features: [
      'Unlimited Pages',
      'All Components & Templates',
      'AI Content Generation',
      'Analytics Integration',
      'Priority Support',
    ],
    cta: 'Get Started',
    href: '/signup',
    popular: true,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <Header />
      <main className="flex-grow">
        <section className="py-24 md:py-32 lg:py-40 bg-background text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground mb-6 text-balance">
              Build Stunning Landing Pages, Effortlessly.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 text-balance">
              LandEase empowers you to create beautiful, high-converting landing pages with an intuitive drag-and-drop editor. No code, no limits.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild size="lg" className="transition-transform duration-300 hover:scale-105">
                <Link href="/signup">Get Started</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="transition-transform duration-300 hover:scale-105">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
        
        <section id="features" className="py-20 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Everything You Need to Succeed
              </h2>
              <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto text-balance">
                Powerful features designed to help you create and launch beautiful pages with ease.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-card shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-2 flex flex-col items-center text-center p-6">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold mb-2">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Launch in 3 Simple Steps
              </h2>
              <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto text-balance">
                From idea to live page in minutes. Here's how it works.
              </p>
            </div>
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden md:block" aria-hidden="true"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {howItWorks.map((step) => (
                    <div key={step.step} className="flex flex-col items-center text-center">
                        <div className="flex items-center justify-center w-24 h-24 rounded-full bg-secondary border-4 border-background mb-6 shadow-sm">
                            {step.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                    </div>
                ))}
                </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-20 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    Simple, Transparent Pricing
                </h2>
                <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto text-balance">
                    Choose the plan that's right for you. Get started for free.
                </p>
            </div>
            <div className="flex justify-center items-stretch gap-8 flex-wrap">
              {pricingPlans.map((plan) => (
                <Card key={plan.title} className={`w-full max-w-sm flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 ${plan.popular ? 'border-primary shadow-lg' : 'shadow-sm'}`}>
                  {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.title}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <div className="mb-6 text-center">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.frequency}</span>
                    </div>
                    <ul className="space-y-3 flex-grow">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <Check className="w-5 h-5 text-primary mr-3 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button asChild className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                      <Link href={plan.href}>{plan.cta}</Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-8 bg-background border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; <CurrentYear /> LandEase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
