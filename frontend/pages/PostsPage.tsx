import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useBackend } from '../hooks/useBackend';
import { useAuth } from '../contexts/AuthContext';
import { CreatePostDialog } from '../components/CreatePostDialog';
import { Heart, MessageCircle, Eye, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function PostsPage() {
  const backend = useBackend();
  const { isAuthenticated } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const { data: postsData, isLoading, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: () => backend.content.listPosts({}),
  });

  const formatContent = (content: string, contentType: string) => {
    if (contentType === 'markdown') {
      // Simple markdown rendering - in a real app, use a proper markdown parser
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
    }
    return content;
  };

  const getUserInitials = (authorId: number) => {
    return `U${authorId}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-gray-600">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Posts</h1>
          <p className="text-gray-600 mt-2">
            Share insights, ask questions, and engage with the startup community
          </p>
        </div>
        
        {isAuthenticated && (
          <Button onClick={() => setShowCreatePost(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        )}
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {postsData?.posts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="" alt={`User ${post.authorId}`} />
                  <AvatarFallback>{getUserInitials(post.authorId)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">User {post.authorId}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500 text-sm">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {post.title && (
                    <h3 className="text-xl font-semibold text-gray-900 mt-2">
                      {post.title}
                    </h3>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div 
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(post.content, post.contentType) 
                }}
              />
              
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              <div className="flex items-center gap-6 pt-4 border-t">
                <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">{post.likeCount}</span>
                </button>
                
                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post.commentCount}</span>
                </button>
                
                <div className="flex items-center gap-2 text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{post.viewCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {postsData?.posts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                <p>Be the first to share something with the community!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Post Dialog */}
      <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <CreatePostDialog 
            onSuccess={() => {
              setShowCreatePost(false);
              refetch();
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
