import React from 'react';
//import { SidebarProvider, SidebarInset } from '../ui/sidebar';
import { AppSidebar } from './AppSidebar'; // AppSidebar के लिए सही पाथ
import { SidebarProvider,SidebarInset } from '../sidebar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset style={{ flexGrow: 1, overflowY: 'auto' }}>
          <div className="flex flex-col flex-1 items-center w-full"> {/* <<-- यहां बदलाव है */}
          
            <div className="w-full  flex-grow"> {/* <<-- यह भी बदला गया है */}
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}