import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import { 
  RefreshCw, 
  Users, 
  CheckCircle,
  AlertCircle,
  Database
} from "lucide-react";
import { requireAdminUser, syncAllUsers } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('🔄 Admin Sync Users Loader - Starting...');
  
  try {
    const adminUser = await requireAdminUser(request);
    
    console.log('✅ Admin Sync Users Loader - Admin access verified');
    return json({ adminUser });
  } catch (error) {
    console.error('❌ Admin Sync Users Loader - Error:', error);
    throw error;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  console.log('🔄 Admin Sync Users Action - Starting...');
  
  try {
    const adminUser = await requireAdminUser(request);
    const formData = await request.formData();
    const action = formData.get("_action") as string;

    if (action === "syncUsers") {
      const syncedCount = await syncAllUsers();
      
      console.log('✅ Admin Sync Users Action - Sync completed');
      return json({ 
        success: true, 
        message: `Successfully synced ${syncedCount} users from auth.users to profiles table`,
        syncedCount 
      });
    }

    return json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error('❌ Admin Sync Users Action - Error:', error);
    return json({ error: "Failed to sync users" }, { status: 500 });
  }
}

export default function AdminSyncUsers() {
  const { adminUser } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Synchronization</h1>
          <p className="text-gray-600">Sync users between auth.users and profiles tables</p>
        </div>
      </div>

      {/* Action Feedback */}
      {actionData?.success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {actionData.message}
              </p>
              {actionData.syncedCount !== undefined && (
                <p className="text-sm text-green-700 mt-1">
                  {actionData.syncedCount} users were synchronized.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {actionData?.error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {actionData.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sync Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Database Synchronization
            </h3>
            <p className="text-gray-600 mb-4">
              This tool helps synchronize users between the authentication system (auth.users) 
              and the application profiles (public.profiles). This is useful when:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 mb-6">
              <li>Users exist in auth.users but not in profiles</li>
              <li>Manual user creation was done outside the normal flow</li>
              <li>Database triggers were not working properly</li>
              <li>After database migrations or restorations</li>
            </ul>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">
                    Automatic Synchronization
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    New users are automatically synchronized when they sign up through the normal process. 
                    This manual sync is only needed for existing users or special cases.
                  </p>
                </div>
              </div>
            </div>

            <Form method="post">
              <input type="hidden" name="_action" value="syncUsers" />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Syncing Users...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Sync Users Now
                  </>
                )}
              </button>
            </Form>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Technical Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">What happens during sync:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Identifies users in auth.users without profiles</li>
              <li>• Creates corresponding profile records</li>
              <li>• Sets default role as 'user'</li>
              <li>• Sets initial balance to 0</li>
              <li>• Preserves original creation timestamps</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Safety measures:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Skips users that already have profiles</li>
              <li>• Handles duplicate key errors gracefully</li>
              <li>• Logs all operations for audit trail</li>
              <li>• Does not modify existing profile data</li>
              <li>• Maintains referential integrity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}