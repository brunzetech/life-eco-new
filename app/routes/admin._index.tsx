import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { 
  Users, 
  UserCheck, 
  BarChart3, 
  ShoppingCart, 
  Activity, 
  DollarSign,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { requireAdminUser, getAllUsers, getAllGroups } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('📊 Admin Dashboard Loader - Starting...');
  
  try {
    const adminUser = await requireAdminUser(request);
    
    // Fetch dashboard data
    const [users, groups] = await Promise.all([
      getAllUsers(),
      getAllGroups(),
    ]);

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(user => !user.is_suspended).length,
      suspendedUsers: users.filter(user => user.is_suspended).length,
      adminUsers: users.filter(user => user.role === 'admin').length,
      totalGroups: groups.length,
      totalBalance: users.reduce((sum, user) => sum + (Number(user.balance) || 0), 0),
    };

    console.log('✅ Admin Dashboard Loader - Data loaded successfully');
    return json({ adminUser, stats, recentUsers: users.slice(0, 5) });
  } catch (error) {
    console.error('❌ Admin Dashboard Loader - Error:', error);
    throw error;
  }
}

export default function AdminDashboard() {
  const { adminUser, stats, recentUsers } = useLoaderData<typeof loader>();

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "blue",
      description: `${stats.activeUsers} active, ${stats.suspendedUsers} suspended`
    },
    {
      title: "User Groups",
      value: stats.totalGroups,
      icon: UserCheck,
      color: "green",
      description: "Organized user groups"
    },
    {
      title: "Total Balance",
      value: `${stats.totalBalance.toLocaleString()} ESSENCE`,
      icon: DollarSign,
      color: "purple",
      description: "Combined user balances"
    },
    {
      title: "Admin Users",
      value: stats.adminUsers,
      icon: AlertCircle,
      color: "red",
      description: "System administrators"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {adminUser.full_name || adminUser.email}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your Life Economy platform today.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-green-600">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">System Healthy</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
            <p className="text-sm text-gray-600">Latest user registrations</p>
          </div>
          <div className="p-6">
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.full_name || user.email}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {user.role} • {user.balance} ESSENCE
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      {user.is_suspended && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Suspended
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No users found</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-600">Common administrative tasks</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/admin/users"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Manage Users</span>
              </a>
              <a
                href="/admin/groups"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UserCheck className="w-6 h-6 text-green-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Manage Groups</span>
              </a>
              <a
                href="/admin/transactions"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">View Transactions</span>
              </a>
              <a
                href="/admin/marketplace"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-gray-900">Marketplace</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}