import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

interface CreatePostDialogProps {
  onSuccess: () => void;
}

export function CreatePostDialog({ onSuccess }: CreatePostDialogProps) {
  const backend = useBackend();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    contentType: 'text' as 'text' | 'markdown',
    tags: [] as string[],
    newTag: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      await backend.content.createPost({
        authorId: user.id,
        title: form.title || undefined,
        content: form.content,
        contentType: form.contentType,
        tags: form.tags,
      });

      toast({
        title: 'Post created!',
        description: 'Your post has been published successfully.',
      });

      onSuccess();
    } catch (error) {
      console.error('Create post error:', error);
      toast({
        title: 'Failed to create post',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (form.newTag.trim() && !form.tags.includes(form.newTag.trim())) {
      setForm({
        ...form,
        tags: [...form.tags, form.newTag.trim()],
        newTag: '',
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm({
      ...form,
      tags: form.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title (Optional)</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Give your post a title..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content-type">Content Type</Label>
        <Select
          value={form.contentType}
          onValueChange={(value: 'text' | 'markdown') => setForm({ ...form, contentType: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Plain Text</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder={
            form.contentType === 'markdown'
              ? 'Write your post using markdown...\n\n**Bold text**\n*Italic text*\n`code`'
              : 'What would you like to share with the community?'
          }
          rows={8}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            value={form.newTag}
            onChange={(e) => setForm({ ...form, newTag: e.target.value })}
            onKeyPress={handleKeyPress}
            placeholder="Add a tag..."
          />
          <Button type="button" onClick={addTag} variant="outline">
            Add
          </Button>
        </div>
        
        {form.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <Button type="submit" disabled={isLoading || !form.content.trim()}>
          {isLoading ? 'Publishing...' : 'Publish Post'}
        </Button>
      </div>
    </form>
  );
}
