
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserCircle, Users, FileText, Calendar, Clock, BarChart, LogOut } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar user={user} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col">
          <header className="bg-white shadow-sm h-16 flex items-center">
            <div className="flex items-center px-4 sm:px-6 lg:px-8 w-full">
              <SidebarTrigger className="text-ems-primary" />
              <div className="ml-6 text-ems-primary font-semibold">
                SECEL Sarl - Système de Gestion du Personnel
              </div>
              <div className="ml-auto flex items-center space-x-4">
                {user && (
                  <>
                    <span className="text-sm text-gray-700 hidden md:inline-block">
                      Bienvenue, {user.name}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </Button>
                  </>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

interface AppSidebarProps {
  user: any;
  onLogout: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const { isAdmin, isManager } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center">
          <div className="mr-2 text-2xl font-bold text-white">SECEL</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/dashboard")}>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Tableau de bord</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {(isAdmin || isManager) && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate("/employees")}>
                <Users className="mr-2 h-4 w-4" />
                <span>Employés</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/attendance")}>
              <Clock className="mr-2 h-4 w-4" />
              <span>Présence</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/calendar")}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Calendrier</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate("/reports")}>
                <BarChart className="mr-2 h-4 w-4" />
                <span>Rapports</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => navigate("/profile")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Mon Profil</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {user && (
          <div className="flex flex-col">
            <div className="flex items-center mb-2">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium text-white">{user.name}</div>
                <div className="text-xs text-gray-300">{user.role}</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-white border-gray-600 hover:bg-sidebar-accent"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardLayout;
