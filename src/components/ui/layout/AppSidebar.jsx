// AppSidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
// IMPORTANT: REMOVE SidebarInset from here!
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from '../sidebar'; // Adjust this path if necessary

import {
  FileText, Users, LogOut, FileSignature as OrderFormIcon, Edit3 as BrandingIcon, LayoutDashboard,
  ClipboardList, FileCheck2, BookCopy, Archive, ShoppingCart, PenSquare, ShieldCheck, Settings
} from 'lucide-react';

import { cn } from '../../../lib/utils';

const AppLogo = () => (
  <Link to="/dashboard" className="flex items-center gap-2 px-2 py-1 text-lg font-semibold">
    <img
      src="/images/revynox_logo_black.png"
      alt="Revynox Logo"
      style={{ width: '140px', height: '40px' }}
      className="dark:invert"
    />
  </Link>
);

const AppIcon = () => (
  <img
    src="/images/revynox_logo_black.png"
    alt="Revynox Icon"
    style={{ width: '28px', height: '28px' }}
    className="dark:invert"
  />
);

export function AppSidebar() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  const mainMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/orderforms', label: 'Order Forms', icon: OrderFormIcon },
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
    { href: '/item-repository', label: 'Item Repository', icon: Archive },
  ];

  const brandingAndTemplatesGroup = {
    label: "Branding & Templates",
    icon: BrandingIcon,
    items: [
      { href: '/branding-numbering', label: 'Branding & Numbering', icon: BrandingIcon },
      { href: '/term&condition', label: 'T&C Templates', icon: ClipboardList },
      { href: '/msatemplate', label: 'MSA Templates', icon: FileCheck2 },
      { href: '/coverpage', label: 'Cover Pages', icon: BookCopy },
    ]
  };

  const eSignatureMenuItems = [
    { href: '/e-signature/select-document', label: 'Send for Signature', icon: PenSquare },
  ];

  const adminNavItems = [
    { href: '/admin/dashboard', label: 'User Management', icon: ShieldCheck },
    { href: '/admin/settings', label: 'Email Settings', icon: Settings },
  ];

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    // Sidebar is now a direct child of SidebarProvider in App.js
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex h-16 items-center justify-start group-data-[collapsible=icon]:justify-center">
          <div className="group-data-[collapsible=icon]:hidden">
            <AppLogo />
          </div>
          <div className="hidden group-data-[collapsible=icon]:block">
            <AppIcon />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="flex-1">
        {isAdminRoute ? (
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive(item.href)}
                  tooltip={item.label}
                  className={cn(
                    "justify-start",
                    { 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30': isActive(item.href) }
                  )}
                >
                  <Link to={item.href}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ) : (
          <>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    className={cn(
                      "justify-start",
                      { 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30': isActive(item.href) }
                    )}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                <span className="group-data-[collapsible=icon]:hidden">{brandingAndTemplatesGroup.label}</span>
                <brandingAndTemplatesGroup.icon className="hidden group-data-[collapsible=icon]:block h-5 w-5" />
              </SidebarGroupLabel>
              <SidebarMenu>
                {brandingAndTemplatesGroup.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                      className={cn(
                        "justify-start",
                        { 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30': isActive(item.href) }
                      )}
                    >
                      <Link to={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                <span className="group-data-[collapsible=icon]:hidden">E-Signature</span>
                <PenSquare className="hidden group-data-[collapsible=icon]:block h-5 w-5" />
              </SidebarGroupLabel>
              <SidebarMenu>
                {eSignatureMenuItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                      className={cn(
                        "justify-start",
                        { 'bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20 dark:text-primary dark:hover:bg-primary/30': isActive(item.href) }
                      )}
                    >
                      <Link to={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to={isAdminRoute ? "/auth/admin/login" : "/"}>
              <SidebarMenuButton tooltip="Logout" className="justify-start w-full">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

AppSidebar.displayName = "AppSidebar";