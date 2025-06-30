import { createServerClient, parse, serialize } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "@remix-run/node";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseAdmin } from "./supabase-admin";

console.log('🔍 Auth Server - Environment check:');
console.log('- process.env.SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
console.log('- process.env.SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing');

export function getSupabaseWithSessionAndHeaders({
  request,
  headers = new Headers(),
}: {
  request: Request;
  headers?: Headers;
}) {
  const cookies = parse(request.headers.get("Cookie") ?? "");

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ Auth Server - Missing required environment variables');
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required");
  }

  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(key) {
          return cookies[key];
        },
        set(key, value, options) {
          headers.append("Set-Cookie", serialize(key, value, options));
        },
        remove(key, options) {
          headers.append("Set-Cookie", serialize(key, "", options));
        },
      },
    }
  );

  return { supabase, headers };
}

export async function getAuthSession(request: Request): Promise<Session | null> {
  try {
    const { supabase } = getSupabaseWithSessionAndHeaders({ request });
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('❌ Auth Server - Error getting session:', error);
    return null;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Auth Server - Sign in error:', error.message);
      throw new Error(error.message);
    }

    console.log('✅ Auth Server - Sign in successful');
    return data;
  } catch (error) {
    console.error('❌ Auth Server - Sign in failed:', error);
    throw error;
  }
}

export async function signUp(email: string, password: string, userData?: { full_name?: string }) {
  try {
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: userData || {},
      },
    });

    if (error) {
      console.error('❌ Auth Server - Sign up error:', error.message);
      throw new Error(error.message);
    }

    // The profile will be automatically created by the database trigger
    console.log('✅ Auth Server - Sign up successful, profile will be auto-created');
    return data;
  } catch (error) {
    console.error('❌ Auth Server - Sign up failed:', error);
    throw error;
  }
}

export async function signOut(request: Request) {
  try {
    const { supabase, headers } = getSupabaseWithSessionAndHeaders({ request });
    await supabase.auth.signOut();
    console.log('✅ Auth Server - Sign out successful');
    return redirect("/login", { headers });
  } catch (error) {
    console.error('❌ Auth Server - Sign out error:', error);
    return redirect("/login");
  }
}

export async function requireUserId(request: Request): Promise<string> {
  try {
    const session = await getAuthSession(request);
    if (!session?.user?.id) {
      console.log('🔒 Auth Server - No valid session, redirecting to login');
      throw redirect("/login");
    }
    return session.user.id;
  } catch (error) {
    console.error('❌ Auth Server - Error requiring user ID:', error);
    throw redirect("/login");
  }
}

export async function requireAdminUser(request: Request) {
  try {
    const userId = await requireUserId(request);
    const userProfile = await getUserProfile(userId);
    
    if (!userProfile || (userProfile.role !== 'admin' && userProfile.role !== 'Super Admin')) {
      console.log('🔒 Auth Server - User is not admin, redirecting to dashboard');
      throw redirect("/dashboard");
    }
    
    console.log('✅ Auth Server - Admin access granted');
    return userProfile;
  } catch (error) {
    console.error('❌ Auth Server - Error requiring admin user:', error);
    throw redirect("/dashboard");
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("❌ Auth Server - Error fetching user profile:", error);
      
      // If profile doesn't exist, try to create it from auth.users
      if (error.code === 'PGRST116') {
        console.log('🔄 Auth Server - Profile not found, attempting to sync from auth.users');
        await syncUserProfile(userId);
        
        // Try fetching again
        const { data: newProfile, error: retryError } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
          
        if (retryError) {
          console.error("❌ Auth Server - Error fetching profile after sync:", retryError);
          return null;
        }
        
        return newProfile;
      }
      
      return null;
    }

    console.log('✅ Auth Server - User profile fetched successfully');
    return profile;
  } catch (error) {
    console.error("❌ Auth Server - Error in getUserProfile:", error);
    return null;
  }
}

export async function syncUserProfile(userId: string) {
  try {
    console.log('🔄 Auth Server - Syncing user profile for:', userId);
    
    // Get user from auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (authError || !authUser.user) {
      console.error('❌ Auth Server - Error fetching auth user:', authError);
      return null;
    }
    
    // Create profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authUser.user.id,
        email: authUser.user.email,
        full_name: authUser.user.user_metadata?.full_name || authUser.user.user_metadata?.name,
        role: 'user',
        balance: 0,
        is_suspended: false,
        created_at: authUser.user.created_at,
      })
      .select()
      .single();
      
    if (profileError) {
      console.error('❌ Auth Server - Error creating profile:', profileError);
      return null;
    }
    
    console.log('✅ Auth Server - Profile synced successfully');
    return profile;
  } catch (error) {
    console.error('❌ Auth Server - Error in syncUserProfile:', error);
    return null;
  }
}

export async function getAllUsers() {
  try {
    console.log('📊 Auth Server - Fetching all users...');
    
    const { data: users, error } = await supabaseAdmin
      .from("profiles")
      .select(`
        *,
        groups!fk_profiles_group_id (
          id,
          name,
          type
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Auth Server - Error fetching users:", error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    console.log(`✅ Auth Server - Fetched ${users?.length || 0} users successfully`);
    return users || [];
  } catch (error) {
    console.error("❌ Auth Server - Error in getAllUsers:", error);
    throw error;
  }
}

export async function getAllGroups() {
  try {
    console.log('📊 Auth Server - Fetching all groups...');
    
    const { data: groups, error } = await supabaseAdmin
      .from("groups")
      .select(`
        *,
        member_count:profiles!fk_profiles_group_id(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("❌ Auth Server - Error fetching groups:", error);
      throw new Error(`Failed to fetch groups: ${error.message}`);
    }

    console.log(`✅ Auth Server - Fetched ${groups?.length || 0} groups successfully`);
    return groups || [];
  } catch (error) {
    console.error("❌ Auth Server - Error in getAllGroups:", error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  try {
    console.log('📝 Auth Server - Updating user profile:', userId);
    
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("❌ Auth Server - Error updating user profile:", error);
      throw new Error(`Failed to update user: ${error.message}`);
    }

    console.log('✅ Auth Server - User profile updated successfully');
    return data;
  } catch (error) {
    console.error("❌ Auth Server - Error in updateUserProfile:", error);
    throw error;
  }
}

export async function createGroup(groupData: any) {
  try {
    console.log('📝 Auth Server - Creating new group:', groupData.name);
    
    const { data, error } = await supabaseAdmin
      .from("groups")
      .insert({
        ...groupData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Auth Server - Error creating group:", error);
      throw new Error(`Failed to create group: ${error.message}`);
    }

    console.log('✅ Auth Server - Group created successfully');
    return data;
  } catch (error) {
    console.error("❌ Auth Server - Error in createGroup:", error);
    throw error;
  }
}

export async function updateGroup(groupId: string, updates: any) {
  try {
    console.log('📝 Auth Server - Updating group:', groupId);
    
    // Create a fresh Supabase client to avoid schema cache issues
    const freshSupabaseAdmin = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    const { data, error } = await freshSupabaseAdmin
      .from("groups")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", groupId)
      .select()
      .single();

    if (error) {
      console.error("❌ Auth Server - Error updating group:", error);
      throw new Error(`Failed to update group: ${error.message}`);
    }

    console.log('✅ Auth Server - Group updated successfully');
    return data;
  } catch (error) {
    console.error("❌ Auth Server - Error in updateGroup:", error);
    throw error;
  }
}

export async function deleteGroup(groupId: string) {
  try {
    console.log('🗑️ Auth Server - Deleting group:', groupId);
    
    // First, remove group association from users
    await supabaseAdmin
      .from("profiles")
      .update({ group_id: null })
      .eq("group_id", groupId);
    
    // Then delete the group
    const { error } = await supabaseAdmin
      .from("groups")
      .delete()
      .eq("id", groupId);

    if (error) {
      console.error("❌ Auth Server - Error deleting group:", error);
      throw new Error(`Failed to delete group: ${error.message}`);
    }

    console.log('✅ Auth Server - Group deleted successfully');
    return true;
  } catch (error) {
    console.error("❌ Auth Server - Error in deleteGroup:", error);
    throw error;
  }
}

export async function logAuditAction(action: {
  action_type: string;
  target_modules: string[];
  performed_by?: string;
  details?: any;
  file_name?: string;
}) {
  try {
    const { error } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        ...action,
        timestamp: new Date().toISOString(),
        status: 'success',
        details: action.details || {},
      });

    if (error) {
      console.error("❌ Auth Server - Error logging audit action:", error);
    } else {
      console.log('✅ Auth Server - Audit action logged successfully');
    }
  } catch (error) {
    console.error("❌ Auth Server - Error in logAuditAction:", error);
  }
}

// Function to manually sync all existing users
export async function syncAllUsers() {
  try {
    console.log('🔄 Auth Server - Syncing all users...');
    
    const { data, error } = await supabaseAdmin.rpc('sync_existing_users');
    
    if (error) {
      console.error('❌ Auth Server - Error syncing users:', error);
      throw new Error(`Failed to sync users: ${error.message}`);
    }
    
    console.log(`✅ Auth Server - Synced ${data} users successfully`);
    return data;
  } catch (error) {
    console.error('❌ Auth Server - Error in syncAllUsers:', error);
    throw error;
  }
}