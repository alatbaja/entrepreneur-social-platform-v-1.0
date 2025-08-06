import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';

interface CreateOfficeHoursDialogProps {
  onSuccess: () => void;
}

export function CreateOfficeHoursDialog({ onSuccess }: CreateOfficeHoursDialogProps) {
  const backend = useBackend();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    durationMinutes: 30,
    priceCents: 0,
    timezone: 'UTC',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      await backend.booking.createOfficeHours({
        expertId: user.id,
        title: form.title,
        description: form.description || undefined,
        durationMinutes: form.durationMinutes,
        priceCents: form.priceCents,
        timezone: form.timezone,
      });

      toast({
        title: 'Office hours created!',
        description: 'Your office hours offering has been created successfully.',
      });

      onSuccess();
    } catch (error) {
      console.error('Create office hours error:', error);
      toast({
        title: 'Failed to create office hours',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g., Product Strategy Session"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe what you'll help with in this session..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Select
            value={form.durationMinutes.toString()}
            onValueChange={(value) => setForm({ ...form, durationMinutes: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
              <SelectItem value="120">120 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            type="number"
            min="0"
            step="1"
            value={form.priceCents / 100}
            onChange={(e) => setForm({ ...form, priceCents: Math.round(parseFloat(e.target.value || '0') * 100) })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Timezone</Label>
        <Select
          value={form.timezone}
          onValueChange={(value) => setForm({ ...form, timezone: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UTC">UTC</SelectItem>
            <SelectItem value="America/New_York">Eastern Time</SelectItem>
            <SelectItem value="America/Chicago">Central Time</SelectItem>
            <SelectItem value="America/Denver">Mountain Time</SelectItem>
            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
            <SelectItem value="Europe/London">London</SelectItem>
            <SelectItem value="Europe/Paris">Paris</SelectItem>
            <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading || !form.title.trim()}>
          {isLoading ? 'Creating...' : 'Create Office Hours'}
        </Button>
      </div>
    </form>
  );
}
