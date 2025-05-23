
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Users, BarChart3, Calendar, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Index = () => {
  const [email, setEmail] = useState('');

  const features = [
    {
      icon: <MessageSquare className="h-10 w-10 text-emmaccent" />,
      title: "Automated Conversations",
      description: "AI-powered conversations that qualify leads and schedule appointments without human intervention."
    },
    {
      icon: <Users className="h-10 w-10 text-emmaccent" />,
      title: "Lead Management",
      description: "Organize, track, and prioritize leads through your sales pipeline with intelligent routing."
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-emmaccent" />,
      title: "Performance Analytics",
      description: "Gain insights into conversation performance, conversion rates, and follow-up effectiveness."
    },
    {
      icon: <Calendar className="h-10 w-10 text-emmaccent" />,
      title: "Smart Scheduling",
      description: "Automate appointment setting with calendar integration that matches agent availability."
    },
    {
      icon: <Clock className="h-10 w-10 text-emmaccent" />,
      title: "24/7 Availability",
      description: "Never miss a lead with round-the-clock response and qualification."
    },
    {
      icon: <Shield className="h-10 w-10 text-emmaccent" />,
      title: "Compliance Built-in",
      description: "Stay compliant with regulations through carefully designed conversation protocols."
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/leads';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative bg-emmblue">
        <div className="container mx-auto px-4 py-24 flex flex-col items-center text-white">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-emmaccent" />
            <span className="font-bold text-lg">Relay</span>
          </div>

          <div className="absolute top-4 right-4 space-x-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-white hover:text-white/90">Log In</Button>
            </Link>
            <Link to="/auth?signup=true">
              <Button className="bg-emmaccent hover:bg-emmaccent-light">Sign Up</Button>
            </Link>
          </div>

          <div className="max-w-3xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              AI-Powered Inside Sales Agents 
              <span className="text-emmaccent"> for Real Estate & Mortgage Industries</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 text-white/90">
              Relay automates lead qualification, nurturing, and handoff so your team can focus on closing deals, not chasing leads.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?signup=true">
                <Button size="lg" className="bg-emmaccent hover:bg-emmaccent-light">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/diagnostics">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="bg-white/20 text-white border border-white hover:bg-white/30"
                >
                  System Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Relay Transforms Your Sales Process</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform handles the repetitive parts of the sales process, freeing your team to focus on closing deals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="data-card p-6 flex flex-col items-start">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emmblue text-white py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your sales process?</h2>
            <p className="text-lg mb-8 text-white/90">
              Get started with Relay today and see how our AI-powered platform can help your team close more deals.
            </p>
            
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />
              <Button type="submit" className="bg-emmaccent hover:bg-emmaccent-light whitespace-nowrap">
                Start Free Trial
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-8 px-4 border-t">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <MessageSquare className="h-6 w-6 text-emmaccent mr-2" />
            <span className="font-bold">Relay</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Relay. All rights reserved.
          </div>
          
          <div className="flex gap-8 mt-4 md:mt-0">
            <Link to="/auth" className="text-sm hover:text-emmaccent">Log In</Link>
            <Link to="/auth?signup=true" className="text-sm hover:text-emmaccent">Sign Up</Link>
            <Link to="/diagnostics" className="text-sm hover:text-emmaccent">Demo</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
