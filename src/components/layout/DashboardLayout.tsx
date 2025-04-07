import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Calendar as CalendarIcon, 
  Clock, 
  BarChart3, 
  LogOut, 
  User,
  FileText,
  ClipboardList,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const navItems = [
    { 
      path: '/dashboard', 
      name: 'Dashboard', 
      icon: <Home className="h-5 w-5" /> 
    },
    { 
      path: '/employees', 
      name: 'Employees', 
      icon: <Users className="h-5 w-5" />,
      restricted: !isManager && !isAdmin
    },
    { 
      path: '/attendance', 
      name: 'Attendance', 
      icon: <Clock className="h-5 w-5" /> 
    },
    { 
      path: '/leaves', 
      name: 'Leave Management', 
      icon: <CalendarDays className="h-5 w-5" />,
      restricted: !isManager && !isAdmin
    },
    { 
      path: '/payroll', 
      name: 'Payroll', 
      icon: <FileText className="h-5 w-5" />,
      restricted: !isManager && !isAdmin
    },
    { 
      path: '/tasks', 
      name: 'Tasks', 
      icon: <ClipboardList className="h-5 w-5" /> 
    },
    { 
      path: '/calendar', 
      name: 'Calendar', 
      icon: <CalendarIcon className="h-5 w-5" /> 
    },
    { 
      path: '/reports', 
      name: 'Reports', 
      icon: <BarChart3 className="h-5 w-5" />,
      restricted: !isAdmin
    },
  ];

  const displayNavItems = navItems.filter(item => !item.restricted);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar} 
              className="mr-4 md:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/dashboard" className="text-lg font-bold text-ems-primary">
              <img 
                src="/lovable-uploads/a53ff322-844e-43f7-8e6a-f633989d1f1b.png" 
                alt="SECEL Sarl Logo" 
                className="h-8" 
              />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-ems-secondary text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer w-full">
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar for mobile - overlay */}
        {isMobile && (
          <div 
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden ${
              isSidebarOpen ? 'block' : 'hidden'
            }`}
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`
            ${isMobile 
              ? `fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out ${
                  isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : 'w-64 shrink-0'}
            bg-ems-primary text-white
          `}
        >
          <div className="p-4 flex justify-between items-center border-b border-ems-secondary md:border-none">
            <Link to="/dashboard" className="text-lg font-bold">SECEL Sarl</Link>
            {isMobile && (
              <button onClick={closeSidebar} aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
            )}
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {displayNavItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-md
                      ${location.pathname === item.path
                        ? 'bg-ems-secondary'
                        : 'hover:bg-ems-secondary/60'
                      }
                      transition-colors
                    `}
                    onClick={closeSidebar}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-4 border-t border-ems-secondary mt-8">
              <Link 
                to="/profile" 
                className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-ems-secondary/60 transition-colors"
                onClick={closeSidebar}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2 rounded-md w-full text-left hover:bg-ems-secondary/60 transition-colors text-red-300"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
