import { supabase } from './supabase'

export interface PostWithDetails {
  id: string
  user_id: string
  image_url: string
  park_name: string
  caption: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
  // Profile info
  profile_username: string | null
  profile_avatar_url: string | null
  profile_bio: string | null
  // Engagement counts
  likes_count: number
  comments_count: number
  user_liked: boolean
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  parent_comment_id: string | null
  created_at: string
  updated_at: string
  // Profile info
  profile_username: string | null
  profile_avatar_url: string | null
}

export async function fetchHomeFeed(
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<PostWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(
        `
        id,
        user_id,
        image_url,
        park_name,
        caption,
        latitude,
        longitude,
        created_at,
        updated_at,
        profiles!posts_user_id_fkey(username, avatar_url, bio),
        likes!likes_post_id_fkey(count),
        comments!comments_post_id_fkey(count)
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching feed:', error)
      return []
    }

    if (!data) return []

    // Remove duplicates by ID (in case of database issues)
    const uniqueData = data.filter((post: any, index: number, self: any[]) => 
      index === self.findIndex((p: any) => p.id === post.id)
    )

    // Fetch user's likes for this batch
    const postIds = uniqueData.map((p: any) => p.id)
    const { data: userLikes } = await supabase
      .from('likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds)

    const userLikedIds = new Set(userLikes?.map((l: any) => l.post_id) || [])

    // Transform data
    return uniqueData.map((post: any) => ({
      id: post.id,
      user_id: post.user_id,
      image_url: post.image_url,
      park_name: post.park_name,
      caption: post.caption,
      latitude: post.latitude,
      longitude: post.longitude,
      created_at: post.created_at,
      updated_at: post.updated_at,
      profile_username: post.profiles?.username || 'Unknown User',
      profile_avatar_url: post.profiles?.avatar_url,
      profile_bio: post.profiles?.bio,
      likes_count: post.likes?.[0]?.count || 0,
      comments_count: post.comments?.[0]?.count || 0,
      user_liked: userLikedIds.has(post.id),
    }))
  } catch (error) {
    console.error('Error in fetchHomeFeed:', error)
    return []
  }
}

export async function toggleLike(
  userId: string,
  postId: string
): Promise<{ liked: boolean; error: Error | null }> {
  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()

    if (existingLike) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId)

      return { liked: false, error: error ?? null }
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: userId, post_id: postId })

      return { liked: true, error: error ?? null }
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return { liked: false, error: error as Error }
  }
}

export async function fetchPostComments(
  postId: string,
  parentCommentId: string | null = null
): Promise<Comment[]> {
  try {
    let query = supabase
      .from('comments')
      .select(
        `
        id,
        post_id,
        user_id,
        content,
        parent_comment_id,
        created_at,
        updated_at,
        profiles!comments_user_id_fkey(username, avatar_url)
      `
      )
      .eq('post_id', postId)

    if (parentCommentId === null) {
      query = query.is('parent_comment_id', null)
    } else {
      query = query.eq('parent_comment_id', parentCommentId)
    }

    const { data, error } = await query.order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching comments:', error)
      return []
    }

    return (
      data?.map((comment: any) => ({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        content: comment.content,
        parent_comment_id: comment.parent_comment_id,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        profile_username: comment.profiles?.username || 'Unknown User',
        profile_avatar_url: comment.profiles?.avatar_url,
      })) || []
    )
  } catch (error) {
    console.error('Error in fetchPostComments:', error)
    return []
  }
}

export async function addComment(
  userId: string,
  postId: string,
  content: string,
  parentCommentId: string | null = null
): Promise<{ commentId: string | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        post_id: postId,
        content,
        parent_comment_id: parentCommentId,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error adding comment:', error)
      return { commentId: null, error: error ?? null }
    }

    return { commentId: data?.id || null, error: null }
  } catch (error) {
    console.error('Error in addComment:', error)
    return { commentId: null, error: error as Error }
  }
}

export async function deleteComment(
  commentId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    return { error: error ?? null }
  } catch (error) {
    console.error('Error deleting comment:', error)
    return { error: error as Error }
  }
}

export function getAvatarUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

export function getPostImageUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('file://')) return path
  const { data } = supabase.storage.from('post-images').getPublicUrl(path)
  return data.publicUrl
}
