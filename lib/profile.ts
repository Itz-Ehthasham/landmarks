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

export interface Post {
  id: string
  user_id: string
  image_url: string
  park_name: string
  caption: string | null
  latitude: number
  longitude: number
  created_at: string
  updated_at: string
}

export async function fetchUserPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
    return []
  }
  return data || []
}

export async function updatePost(
  postId: string,
  updates: { caption?: string | null; park_name?: string }
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)

  return { error: error ?? null }
}

export async function deletePost(postId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  return { error: error ?? null }
}

export function getPostImagePublicUrl(path: string | null): string | null {
  if (!path) return null
  // Check if it's already a full URL (temporary local URI)
  if (path.startsWith('http') || path.startsWith('file://')) {
    return path
  }
  // If it's a storage path, get public URL
  const { data } = supabase.storage.from('post-images').getPublicUrl(path)
  return data.publicUrl
}
