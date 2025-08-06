import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { UploadPitchDeckDialog } from '../components/UploadPitchDeckDialog';
import { Plus, Eye, Heart, MessageCircle, FileText, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function PitchDecksPage() {
  const backend = useBackend();
  const { isAuthenticated } = useAuth();
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const { data: pitchDecksData, isLoading, refetch } = useQuery({
    queryKey: ['pitch-decks'],
    queryFn: () => backend.pitch.listPitchDecks({}),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return '📄';
    } else if (fileType.includes('presentation')) {
      return '📊';
    }
    return '📁';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-600">Loading pitch decks...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pitch Decks</h1>
          <p className="text-gray-600 mt-2">
            Share your pitch presentations and get feedback from the community
          </p>
        </div>
        
        {isAuthenticated && (
          <Button onClick={() => setShowUploadDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Pitch Deck
          </Button>
        )}
      </div>

      {/* Pitch Decks Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pitchDecksData?.pitchDecks.map((deck) => (
          <Card key={deck.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">
                    {deck.title}
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    by Founder {deck.founderId}
                  </p>
                </div>
                <div className="text-2xl ml-2">
                  {getFileTypeIcon(deck.fileType)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {deck.description && (
                <p className="text-gray-600 text-sm line-clamp-3">
                  {deck.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(deck.status)}>
                  {deck.status}
                </Badge>
                <span className="text-xs text-gray-500">
                  {deck.slideCount} slides
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{deck.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{deck.likeCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{deck.commentCount}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {formatDistanceToNow(new Date(deck.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileText className="w-3 h-3" />
                  <span>{deck.fileName}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {pitchDecksData?.pitchDecks.length === 0 && (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No pitch decks yet</h3>
                  <p>Be the first to share your pitch with the community!</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Pitch Deck</DialogTitle>
          </DialogHeader>
          <UploadPitchDeckDialog 
            onSuccess={() => {
              setShowUploadDialog(false);
              refetch();
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
