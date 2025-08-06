import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { CreateOfficeHoursDialog } from '../components/CreateOfficeHoursDialog';
import { Calendar, Clock, DollarSign, Plus, User, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function BookingPage() {
  const backend = useBackend();
  const { isAuthenticated, user } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => backend.booking.listBookings({}),
    enabled: isAuthenticated,
  });

  // Mock office hours data - in a real app, this would come from an API
  const mockOfficeHours = [
    {
      id: 1,
      expertId: 1,
      title: 'Product Strategy Session',
      description: 'Get expert advice on product roadmap and go-to-market strategy',
      durationMinutes: 60,
      priceCents: 15000, // $150
      expertName: 'Sarah Chen',
      expertTitle: 'Former VP Product at Stripe',
      expertise: ['Product Strategy', 'Go-to-Market', 'SaaS'],
    },
    {
      id: 2,
      expertId: 2,
      title: 'Technical Architecture Review',
      description: 'Review your technical architecture and scaling challenges',
      durationMinutes: 45,
      priceCents: 12000, // $120
      expertName: 'Alex Rodriguez',
      expertTitle: 'CTO at TechCorp',
      expertise: ['System Architecture', 'Scaling', 'DevOps'],
    },
    {
      id: 3,
      expertId: 3,
      title: 'Fundraising Strategy',
      description: 'Prepare for your next funding round with investor insights',
      durationMinutes: 30,
      priceCents: 20000, // $200
      expertName: 'Michael Thompson',
      expertTitle: 'Partner at Venture Capital',
      expertise: ['Fundraising', 'Pitch Deck', 'Due Diligence'],
    },
  ];

  const formatPrice = (priceCents: number) => {
    return `$${(priceCents / 100).toFixed(0)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (bookingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-600">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Office Hours</h1>
          <p className="text-gray-600 mt-2">
            Book 1:1 sessions with experts and investors to accelerate your startup
          </p>
        </div>
        
        {isAuthenticated && user?.role === 'expert' && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Office Hours
          </Button>
        )}
      </div>

      {/* My Bookings Section */}
      {isAuthenticated && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">My Bookings</h2>
          
          {bookingsData?.bookings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600">Book your first session with an expert below!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {bookingsData?.bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{booking.officeHoursTitle}</CardTitle>
                        <p className="text-sm text-gray-600">
                          Expert {booking.expertId}
                        </p>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(booking.scheduledAt).toLocaleDateString()} at{' '}
                        {new Date(booking.scheduledAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{booking.durationMinutes} minutes</span>
                    </div>
                    {booking.notes && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {booking.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Available Office Hours */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Available Office Hours</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockOfficeHours.map((officeHour) => (
            <Card key={officeHour.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">{officeHour.title}</CardTitle>
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{officeHour.expertName}</p>
                  <p className="text-sm text-gray-600">{officeHour.expertTitle}</p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-gray-700 text-sm">{officeHour.description}</p>
                
                <div className="flex flex-wrap gap-1">
                  {officeHour.expertise.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{officeHour.durationMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatPrice(officeHour.priceCents)}</span>
                  </div>
                </div>
                
                <Button className="w-full" disabled={!isAuthenticated}>
                  {isAuthenticated ? 'Book Session' : 'Sign in to Book'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Create Office Hours Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Office Hours</DialogTitle>
          </DialogHeader>
          <CreateOfficeHoursDialog 
            onSuccess={() => {
              setShowCreateDialog(false);
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
