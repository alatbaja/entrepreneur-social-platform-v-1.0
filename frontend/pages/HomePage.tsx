import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { Users, FileText, Presentation, Calendar, TrendingUp, Globe } from 'lucide-react';

export function HomePage() {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Users,
      title: 'Founder Profiles',
      description: 'Create comprehensive profiles that showcase both your personal identity and startup journey.',
    },
    {
      icon: FileText,
      title: 'Discussion Threads',
      description: 'Engage in meaningful conversations with markdown support and code snippets.',
    },
    {
      icon: Presentation,
      title: 'Pitch Decks',
      description: 'Upload and share your pitch presentations with community feedback and annotations.',
    },
    {
      icon: Calendar,
      title: 'Office Hours',
      description: 'Book 1:1 sessions with investors and technical experts to accelerate your growth.',
    },
    {
      icon: TrendingUp,
      title: 'Analytics Dashboard',
      description: 'Track your engagement, views, and meeting requests with detailed insights.',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Connect with entrepreneurs and investors based on industry, stage, and location.',
    },
  ];

  const stats = [
    { label: 'Active Founders', value: '2,500+' },
    { label: 'Investors', value: '150+' },
    { label: 'Pitch Decks', value: '1,200+' },
    { label: 'Office Hours Booked', value: '5,000+' },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Connect. Build. <span className="text-blue-600">Scale.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The premier social platform for entrepreneurs and innovators. Share your journey, 
            get expert feedback, and connect with investors who believe in your vision.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Welcome back, <span className="font-semibold">{user?.username}</span>!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/posts">Browse Posts</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/pitch-decks">View Pitch Decks</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="text-lg px-8 py-3">
              Join StartupVerse
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Learn More
            </Button>
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="bg-blue-50 rounded-2xl p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Everything you need to succeed
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From building your profile to securing funding, StartupVerse provides 
            the tools and community to accelerate your entrepreneurial journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">
            Ready to accelerate your startup?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who are building the future. 
            Share your story, get feedback, and connect with the right people.
          </p>
          {!isAuthenticated && (
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Get Started Today
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
