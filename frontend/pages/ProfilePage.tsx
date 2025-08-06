import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBackend } from '../hooks/useBackend';
import { MapPin, Globe, Linkedin, Twitter, Users, Calendar, Building } from 'lucide-react';

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const backend = useBackend();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['founder-profile', id],
    queryFn: () => backend.profile.getFounderProfile({ id: parseInt(id!) }),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-red-600">Profile not found</div>
      </div>
    );
  }

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profile.avatarUrl} alt={`${profile.firstName} ${profile.lastName}`} />
                <AvatarFallback className="text-2xl">
                  {getUserInitials(profile.firstName, profile.lastName)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                {profile.startup && (
                  <p className="text-xl text-blue-600 font-medium">
                    Founder at {profile.startup.name}
                  </p>
                )}
              </div>

              {profile.bio && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4">
                {profile.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}

                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </a>
                )}

                {profile.twitterUrl && (
                  <a
                    href={profile.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>Twitter</span>
                  </a>
                )}
              </div>

              <div className="flex gap-4">
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  Connect
                </Button>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Meeting
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Startup Information */}
      {profile.startup && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Startup Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              {profile.startup.logoUrl && (
                <img
                  src={profile.startup.logoUrl}
                  alt={`${profile.startup.name} logo`}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">
                  {profile.startup.name}
                </h3>
                {profile.startup.description && (
                  <p className="text-gray-600 mt-2">
                    {profile.startup.description}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {profile.startup.industry && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Industry</label>
                    <div className="mt-1">
                      <Badge variant="secondary">{profile.startup.industry}</Badge>
                    </div>
                  </div>
                )}

                {profile.startup.stage && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Stage</label>
                    <div className="mt-1">
                      <Badge variant="outline">{profile.startup.stage}</Badge>
                    </div>
                  </div>
                )}

                {profile.startup.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="mt-1 text-gray-900">{profile.startup.location}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {profile.startup.foundedYear && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Founded</label>
                    <p className="mt-1 text-gray-900">{profile.startup.foundedYear}</p>
                  </div>
                )}

                {profile.startup.employeeCount && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Team Size</label>
                    <p className="mt-1 text-gray-900">{profile.startup.employeeCount} employees</p>
                  </div>
                )}

                {profile.startup.websiteUrl && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Website</label>
                    <div className="mt-1">
                      <a
                        href={profile.startup.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {profile.startup.websiteUrl}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">12</div>
            <p className="text-gray-600">Published posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">48</div>
            <p className="text-gray-600">Network connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">7</div>
            <p className="text-gray-600">Office hours booked</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
