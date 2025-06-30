import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { 
  TrendingUp, 
  DollarSign, 
  Activity, 
  ShoppingCart, 
  Users, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Award
} from "lucide-react";
import { requireUserId, getUserProfile } from "~/lib/auth.server";
import { Header } from "~/components/Header";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const userProfile = await getUserProfile(userId);

  // Mock data for dashboard - replace with real data later
  const dashboardData = {
    recentTransactions: [
      { id: 1, type: 'credit', amount: 100, description: 'Daily Check-in Reward', date: '2025-01-15' },
      { id: 2, type: 'debit', amount: 50, description: 'Premium Badge Purchase', date: '2025-01-14' },
      { id: 3, type: 'credit', amount: 200, description: 'Referral Bonus', date: '2025-01-13' },
    ],
    availableActivities: [
      { id: 1, name: 'Daily Check-in', reward: 10, description: 'Check in daily to earn rewards' },
      { id: 2, name: 'Weekly Survey', reward: 50, description: 'Complete weekly community survey' },
      { id: 3, name: 'Content Creation', reward: 100, description: 'Create and share content' },
    ],
    featuredItems: [
      { id: 1, name: 'Premium Badge', price: 100, category: 'badges' },
      { id: 2, name: 'Custom Avatar Frame', price: 50, category: 'cosmetics' },
      { id: 3, name: 'Extra Storage', price: 200, category: 'utilities' },
    ]
  };

  return json({ userProfile, dashboardData });
}

export default function Dashboard() {
  const { userProfile, dashboardData } = useLoaderData<typeof loader>();

  const stats = [
    {
      title: "Current Balance",
      value: `${userProfile?.balance?.toLocaleString() || 0} ESSENCE`,
      icon: DollarSign,
      color: "green",
      change: "+12%",
      changeType: "increase"
    },
    {
      title: "Activities Completed",
      value: "23",
      icon: Activity,
      color: "blue",
      change: "+5",
      changeType: "increase"
    },
    {
      title: "Items Purchased",
      value: "8",
      icon: ShoppingCart,
      color: "purple",
      change: "+2",
      changeType: "increase"
    },
    {
      title: "Rank",
      value: "#142",
      icon: Award,
      color: "orange",
      change: "+3",
      changeType: "increase"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userProfile={userProfile} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {userProfile?.full_name || userProfile?.email}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening in your Life Economy today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'increase' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">this week</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recent Transactions</h3>
                  <a href="/transactions" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View all
                  </a>
                </div>
              </div>
              <div className="p-6">
                {dashboardData.recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'credit' ? (
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(transaction.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : '-'}{transaction.amount} ESSENCE
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No transactions yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Available Activities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Available Activities</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {dashboardData.availableActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.name}</p>
                        <p className="text-xs text-gray-500">{activity.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">+{activity.reward}</p>
                        <p className="text-xs text-gray-500">ESSENCE</p>
                      </div>
                    </div>
                  ))}
                </div>
                <a 
                  href="/activities" 
                  className="block w-full mt-4 text-center py-2 px-4 border border-primary-300 text-primary-700 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
                >
                  View All Activities
                </a>
              </div>
            </div>

            {/* Featured Marketplace Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Featured Items</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {dashboardData.featuredItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{item.price}</p>
                        <p className="text-xs text-gray-500">ESSENCE</p>
                      </div>
                    </div>
                  ))}
                </div>
                <a 
                  href="/marketplace" 
                  className="block w-full mt-4 text-center py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Visit Marketplace
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}