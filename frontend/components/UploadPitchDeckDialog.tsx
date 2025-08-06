import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { Upload, FileText } from 'lucide-react';

interface UploadPitchDeckDialogProps {
  onSuccess: () => void;
}

export function UploadPitchDeckDialog({ onSuccess }: UploadPitchDeckDialogProps) {
  const backend = useBackend();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please select a PDF or PowerPoint file.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 50MB.',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFile) return;

    setIsLoading(true);

    try {
      // Get upload URL
      const uploadResponse = await backend.pitch.uploadPitchDeck({
        founderId: user.id,
        title: form.title,
        description: form.description || undefined,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
      });

      // Upload file to signed URL
      const uploadResult = await fetch(uploadResponse.uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error('Failed to upload file');
      }

      toast({
        title: 'Pitch deck uploaded!',
        description: 'Your pitch deck is being processed and will be available soon.',
      });

      onSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
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
          placeholder="Enter pitch deck title..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe your pitch deck..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Pitch Deck File</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            id="file"
            type="file"
            accept=".pdf,.ppt,.pptx"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {selectedFile ? (
            <div className="space-y-2">
              <FileText className="w-8 h-8 mx-auto text-blue-600" />
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file')?.click()}
              >
                Change File
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file')?.click()}
                >
                  Choose File
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  PDF or PowerPoint files up to 50MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button 
          type="submit" 
          disabled={isLoading || !selectedFile || !form.title.trim()}
        >
          {isLoading ? 'Uploading...' : 'Upload Pitch Deck'}
        </Button>
      </div>
    </form>
  );
}
