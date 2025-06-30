import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData, NavLink, Form } from "@remix-run/react";
import { 
  Users, 
  UserCheck, 
  Settings, 
  BarChart3, 
  ShoppingCart, 
  Activity, 
  DollarSign, 
  FileText,
  LogOut,
  Shield,
  RefreshCw
} from "lucide-react";
import { requireAdminUser } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('🔐 Admin Loader - Checking admin access...');
  
  try {
    const adminUser = await requireAdminUser(request);
    
    console.log('✅ Admin Loader - Admin access granted');
    return json({ adminUser });
  } catch (error) {
    console.error('❌ Admin Loader - Access denied:', error);
    throw error; // This will redirect to dashboard
  }
}

export default function AdminLayout() {
  const { adminUser } = useLoaderData<typeof loader>();

  const navigationItems = [
    { to: "/admin/users", icon: Users, label: "Users", description: "Manage user accounts" },
    { to: "/admin/groups", icon: UserCheck, label: "Groups", description: "Organize users into groups" },
    { to: "/admin/sync-users", icon: RefreshCw, label: "Sync Users", description: "Sync auth users with profiles" },
    { to: "/admin/transactions", icon: BarChart3, label: "Transactions", description: "View transaction history" },
    { to: "/admin/marketplace", icon: ShoppingCart, label: "Marketplace", description: "Manage marketplace items" },
    { to: "/admin/activities", icon: Activity, label: "Activities", description: "Manage reward activities" },
    { to: "/admin/expenses", icon: DollarSign, label: "Expenses", description: "Track system expenses" },
    { to: "/admin/audit", icon: FileText, label: "Audit Logs", description: "System audit trail" },
    { to: "/admin/settings", icon: Settings, label: "Settings", description: "System configuration" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                  <p className="text-sm text-gray-500">Life Economy Management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {adminUser.full_name || adminUser.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">{adminUser.role}</p>
              </div>
              
              <Form action="/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </Form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500 group-hover:text-gray-700">
                      {item.description}
                    </div>
                  </div>
                </NavLink>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-medium text-gray-900">-</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Groups</span>
                  <span className="font-medium text-gray-900">-</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Today's Transactions</span>
                  <span className="font-medium text-gray-900">-</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}