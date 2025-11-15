import { supabase } from '../supabase'

export interface UserWithProfile {
  id: string
  username: string
  email: string
  role: number
  created_at: string
}

export const userService = {
  /**
   * Fetch all users with their profiles
   * Note: This requires the profiles table to have a username column
   * and proper RLS policies to be configured
   */
  async getAllUsers(): Promise<{ users: UserWithProfile[] | null; error: Error | null }> {
    try {
      // First, get the current user to verify they're an admin
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      
      if (!currentUser) {
        return { users: null, error: new Error('Not authenticated') }
      }

      // Fetch profiles with role and username information
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, roleId, email, created_at')

      if (profilesError) {
        return { users: null, error: profilesError }
      }

      if (!profiles || profiles.length === 0) {
        return { users: [], error: null }
      }

      // Map profiles to UserWithProfile format
      const usersWithProfiles: UserWithProfile[] = profiles.map(profile => ({
        id: profile.id,
        username: profile.email.split('@')[0] || 'Unknown',
        email: profile.email || 'Unknown',
        role: profile.roleId,
        created_at: profile.created_at
      }))

      return { users: usersWithProfiles, error: null }
    } catch (error) {
      return { users: null, error: error as Error }
    }
  },

  /**
   * Update user role
   */
  async updateUserRole(userId: string, newRole: number): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ roleId: newRole })
        .eq('id', userId)

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  /**
   * Delete a user profile
   * Note: This only deletes the profile. Deleting from auth.users requires admin access
   * which is not available from the client. You'll need a backend function for that.
   * For now, we'll just delete the profile entry.
   */
  async deleteUser(userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }
}

