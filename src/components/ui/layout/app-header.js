import React from 'react';
import { SidebarTrigger } from '../sidebar';
// import { SidebarContent } from '../sidebar'; // This import is not used, can be removed.
import { Button } from '../button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// The useRouter import and its usage are removed.

export function AppHeader({ title, children, showBackButton = false }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        {showBackButton && (
          // The Button for back navigation is removed as router.back() is not available
          // If you need a back button, you'll need to pass an onClick handler as a prop
          // or reintroduce a routing solution like Next.js useRouter or react-router-dom's useNavigate/useHistory
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}  className="mr-2">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        )}
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">{children}</div>
    </header>
  );
}

AppHeader.displayName = "AppHeader";