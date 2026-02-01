import { supabase } from './supabase'

export interface Profile {
  id: string
  username: string
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  return data
}

export async function updateProfile(
  userId: string,
  updates: { username?: string; bio?: string | null; avatar_url?: string | null }
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  return { error: error ?? null }
}

export function getAvatarPublicUrl(path: string | null): string | null {
  if (!path) return null
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}
