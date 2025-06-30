import { Link, Form, useLocation } from "@remix-run/react";
import { useState } from "react";
import { 
  TrendingUp, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Users,
  BarChart3,
  ShoppingCart,
  Activity,
  DollarSign,
  UserCheck,
  Home,
  Bell,
  Search,
  Crown
} from "lucide-react";
import { ClientOnly } from "./ClientOnly";

interface HeaderProps {
  userProfile: {
    id: string;
    email: string;
    full_name?: string;
    role: string;
    balance: number;
    is_suspended: boolean;
    avatar_url?: string;
  } | null;
}

export function Header({ userProfile }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();

  if (!userProfile) {
    return null;
  }

  const isAdmin = userProfile.role === 'admin' || userProfile.role === 'Super Admin';
  const isModerator = userProfile.role === 'moderator';

  // Navigation items based on role
  const getNavigationItems = () => {
    const baseItems = [
      { to: "/dashboard", icon: Home, label: "Dashboard" },
      { to: "/marketplace", icon: ShoppingCart, label: "Marketplace" },
      { to: "/activities", icon: Activity, label: "Activities" },
      { to: "/transactions", icon: BarChart3, label: "Transactions" },
    ];

    if (isModerator || isAdmin) {
      baseItems.push(
        { to: "/moderation", icon: Shield, label: "Moderation" }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const isActivePath = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Life Economy</h1>
                <p className="text-xs text-gray-500">Virtual Economy Platform</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActivePath(item.to)
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Link>
            ))}
            
            {/* Admin Panel Link - Prominent placement */}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  isActivePath("/admin")
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
                }`}
              >
                <Crown className="w-4 h-4 mr-2" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Side - Balance, Notifications, Profile */}
          <div className="flex items-center space-x-4">
            {/* Balance Display */}
            <div className="hidden sm:flex items-center px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                {userProfile.balance.toLocaleString()} ESSENCE
              </span>
            </div>

            {/* Admin Quick Access Button - Mobile/Tablet */}
            {isAdmin && (
              <ClientOnly>
                <Link
                  to="/admin"
                  className={`lg:hidden p-2 rounded-lg transition-colors border ${
                    isActivePath("/admin")
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
                  }`}
                  title="Admin Panel"
                >
                  <Crown className="w-5 h-5" />
                </Link>
              </ClientOnly>
            )}

            {/* Search Button */}
            <ClientOnly>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </ClientOnly>

            {/* Notifications */}
            <ClientOnly>
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </ClientOnly>

            {/* Profile Dropdown */}
            <div className="relative">
              <ClientOnly>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    {userProfile.avatar_url ? (
                      <img 
                        src={userProfile.avatar_url} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile.full_name || userProfile.email}
                    </p>
                    <p className="text-xs text-gray-500 capitalize flex items-center">
                      {isAdmin && <Crown className="w-3 h-3 mr-1 text-red-600" />}
                      {userProfile.role}
                    </p>
                  </div>
                </button>
              </ClientOnly>

              {/* Profile Dropdown Menu */}
              {isProfileMenuOpen && (
                <ClientOnly>
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {userProfile.full_name || userProfile.email}
                      </p>
                      <p className="text-xs text-gray-500">{userProfile.email}</p>
                      <div className="flex items-center mt-2">
                        <DollarSign className="w-3 h-3 text-green-600 mr-1" />
                        <span className="text-xs font-medium text-green-800">
                          {userProfile.balance.toLocaleString()} ESSENCE
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      My Profile
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>

                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-100 my-2"></div>
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 font-medium"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Crown className="w-4 h-4 mr-3" />
                          Admin Panel
                        </Link>
                        <Link
                          to="/admin/users"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ml-4"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Users className="w-4 h-4 mr-3" />
                          Manage Users
                        </Link>
                        <Link
                          to="/admin/groups"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ml-4"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <UserCheck className="w-4 h-4 mr-3" />
                          Manage Groups
                        </Link>
                      </>
                    )}
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <Form action="/logout" method="post">
                        <button
                          type="submit"
                          className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </Form>
                    </div>
                  </div>
                </ClientOnly>
              )}
            </div>

            {/* Mobile Menu Button */}
            <ClientOnly>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </ClientOnly>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <ClientOnly>
            <div className="lg:hidden border-t border-gray-200 py-4">
              <nav className="space-y-2">
                {/* Balance for mobile */}
                <div className="flex items-center justify-center px-3 py-2 bg-green-50 border border-green-200 rounded-lg mx-4 mb-4">
                  <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">
                    {userProfile.balance.toLocaleString()} ESSENCE
                  </span>
                </div>

                {navigationItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                      isActivePath(item.to)
                        ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Link>
                ))}

                {/* Admin Panel Link for Mobile */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-l-4 ${
                      isActivePath("/admin")
                        ? 'bg-red-100 text-red-700 border-red-500'
                        : 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Crown className="w-5 h-5 mr-3" />
                    Admin Panel
                  </Link>
                )}
                
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-3" />
                    My Profile
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Settings
                  </Link>

                  {isAdmin && (
                    <>
                      <Link
                        to="/admin/users"
                        className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Users className="w-5 h-5 mr-3" />
                        Manage Users
                      </Link>
                      <Link
                        to="/admin/groups"
                        className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserCheck className="w-5 h-5 mr-3" />
                        Manage Groups
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </ClientOnly>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(isProfileMenuOpen || isMenuOpen) && (
        <ClientOnly>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsProfileMenuOpen(false);
              setIsMenuOpen(false);
            }}
          />
        </ClientOnly>
      )}
    </header>
  );
}