import React from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { 
  UserCheck, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Crown,
  Shield
} from "lucide-react";
import { requireAdminUser, getAllGroups, createGroup, updateGroup, deleteGroup, logAuditAction } from "~/lib/auth.server";
import { useStore } from "~/store/store";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('👥 Admin Groups Loader - Starting...');
  
  try {
    const adminUser = await requireAdminUser(request);
    const groups = await getAllGroups();

    console.log('✅ Admin Groups Loader - Data loaded successfully');
    return json({ adminUser, groups });
  } catch (error) {
    console.error('❌ Admin Groups Loader - Error:', error);
    throw error;
  }
}

export async function action({ request }: ActionFunctionArgs) {
  console.log('👥 Admin Groups Action - Starting...');
  
  try {
    const adminUser = await requireAdminUser(request);
    const formData = await request.formData();
    const action = formData.get("_action") as string;

    switch (action) {
      case "createGroup": {
        const groupData = {
          name: formData.get("name") as string,
          description: formData.get("description") as string,
          type: formData.get("type") as string,
        };

        const newGroup = await createGroup(groupData);
        
        await logAuditAction({
          action_type: "CREATE_GROUP",
          target_modules: ["groups"],
          performed_by: adminUser.id,
          details: { groupData },
        });

        console.log('✅ Admin Groups Action - Group created successfully');
        return json({ success: true, message: "Group created successfully", group: newGroup });
      }

      case "updateGroup": {
        const groupId = formData.get("groupId") as string;
        const updates = {
          name: formData.get("name") as string,
          description: formData.get("description") as string,
          type: formData.get("type") as string,
        };

        const updatedGroup = await updateGroup(groupId, updates);
        
        await logAuditAction({
          action_type: "UPDATE_GROUP",
          target_modules: ["groups"],
          performed_by: adminUser.id,
          details: { groupId, updates },
        });

        console.log('✅ Admin Groups Action - Group updated successfully');
        return json({ success: true, message: "Group updated successfully", group: updatedGroup });
      }

      case "deleteGroup": {
        const groupId = formData.get("groupId") as string;
        
        await deleteGroup(groupId);
        
        await logAuditAction({
          action_type: "DELETE_GROUP",
          target_modules: ["groups"],
          performed_by: adminUser.id,
          details: { groupId },
        });

        console.log('✅ Admin Groups Action - Group deleted successfully');
        return json({ success: true, message: "Group deleted successfully" });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Admin Groups Action - Error:', error);
    return json({ error: "Failed to perform action" }, { status: 500 });
  }
}

export default function AdminGroups() {
  const { groups } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { setGroups } = useStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  // Update store with fetched groups
  React.useEffect(() => {
    setGroups(groups);
  }, [groups, setGroups]);

  const filteredGroups = groups.filter(group => 
    !searchTerm || 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSubmitting = navigation.state === "submitting";

  const getGroupTypeIcon = (type: string) => {
    switch (type) {
      case 'super_admin':
        return Crown;
      case 'admin':
        return Shield;
      default:
        return UserCheck;
    }
  };

  const getGroupTypeStyle = (type: string) => {
    switch (type) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'premium':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Group Management</h1>
          <p className="text-gray-600">Organize users into groups for better management</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </button>
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

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <UserCheck className="w-4 h-4 mr-2" />
            {filteredGroups.length} of {groups.length} groups
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => {
          const TypeIcon = getGroupTypeIcon(group.type);
          return (
            <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <TypeIcon className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                  </div>
                  
                  {group.description && (
                    <p className="text-sm text-gray-600 mb-3">{group.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {group.member_count?.[0]?.count || 0} members
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(group.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGroupTypeStyle(group.type)}`}>
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {group.type === 'super_admin' ? 'Super Admin' : group.type}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => setEditingGroup(group)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <Form method="post" className="inline">
                    <input type="hidden" name="_action" value="deleteGroup" />
                    <input type="hidden" name="groupId" value={group.id} />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      onClick={(e) => {
                        if (!confirm('Are you sure you want to delete this group? Users in this group will be unassigned.')) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Form>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No groups found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new group.'}
          </p>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Group</h3>
              
              <Form method="post" className="space-y-4">
                <input type="hidden" name="_action" value="createGroup" />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter group name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter group description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Group'}
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {editingGroup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Group: {editingGroup.name}
              </h3>
              
              <Form method="post" className="space-y-4">
                <input type="hidden" name="_action" value="updateGroup" />
                <input type="hidden" name="groupId" value={editingGroup.id} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Group Name</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingGroup.name}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingGroup.description || ''}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    defaultValue={editingGroup.type}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingGroup(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}