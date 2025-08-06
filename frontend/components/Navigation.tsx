import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { AuthDialog } from './AuthDialog';
import { Users, FileText, Presentation, Calendar, Home } from 'lucide-react';

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/posts', label: 'Posts', icon: FileText },
    { path: '/pitch-decks', label: 'Pitch Decks', icon: Presentation },
    { path: '/booking', label: 'Office Hours', icon: Calendar },
  ];

  const getUserInitials = (user: any) => {
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-blue-600">
                StartupVerse
              </Link>
              
              <div className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user?.username} />
                        <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="flex flex-col items-start">
                      <div className="font-medium">{user?.username}</div>
                      <div className="text-xs text-gray-500">{user?.email}</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/profile/${user?.id}`}>Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setShowAuthDialog(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to StartupVerse</DialogTitle>
          </DialogHeader>
          <AuthDialog onSuccess={() => setShowAuthDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
