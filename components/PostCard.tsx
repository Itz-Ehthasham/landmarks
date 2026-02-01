import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { getAvatarUrl, getPostImageUrl, PostWithDetails, toggleLike } from '../lib/postsData'


interface PostCardProps {
  post: PostWithDetails
  currentUserId: string
  onCommentPress: (post: PostWithDetails) => void
  onUserNamePress: (userId: string, username: string) => void
  onLikeChange?: (postId: string, liked: boolean) => void
}

export default function PostCard({
  post,
  currentUserId,
  onCommentPress,
  onUserNamePress,
  onLikeChange,
}: PostCardProps) {
  const [isLiking, setIsLiking] = useState(false)
  const [liked, setLiked] = useState(post.user_liked)
  const [likesCount, setLikesCount] = useState(post.likes_count)

  const handleLikePress = async () => {
    if (isLiking) return

    setIsLiking(true)
    const { liked: newLiked, error } = await toggleLike(currentUserId, post.id)

    if (!error) {
      setLiked(newLiked)
      setLikesCount((prev) => (newLiked ? prev + 1 : Math.max(0, prev - 1)))
      onLikeChange?.(post.id, newLiked)
    }
    setIsLiking(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const imageUrl = getPostImageUrl(post.image_url)
  const avatarUrl = getAvatarUrl(post.profile_avatar_url)

  return (
    <View style={styles.card}>
      {/* Header - Profile Info */}
      <View style={styles.header}>
        {avatarUrl && (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        )}
        {!avatarUrl && (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-circle" size={40} color="#ddd" />
          </View>
        )}
        <TouchableOpacity
          onPress={() =>
            onUserNamePress(post.user_id, post.profile_username || 'Unknown')
          }
          style={styles.headerText}
        >
          <Text style={styles.username}>{post.profile_username}</Text>
          <Text style={styles.parkName}>{post.park_name}</Text>
        </TouchableOpacity>
        <Text style={styles.timestamp}>{formatDate(post.created_at)}</Text>
      </View>

      {/* Image */}
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      )}

      {/* Caption */}
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>{post.caption}</Text>
        </View>
      )}

      {/* Engagement Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statText}>
            <Text style={styles.statNumber}>{likesCount}</Text> likes
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statText}>
            <Text style={styles.statNumber}>{post.comments_count}</Text> comments
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLikePress}
          disabled={isLiking}
        >
          {isLiking ? (
            <ActivityIndicator size="small" color="#E63946" />
          ) : (
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={24}
              color={liked ? '#E63946' : '#666'}
            />
          )}
          <Text
            style={[styles.actionText, liked && styles.actionTextActive]}
          >
            Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onCommentPress(post)}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#666" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={24} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  parkName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  captionContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  caption: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stat: {
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  statNumber: {
    fontWeight: '600',
    color: '#000',
  },
  actions: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 4,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  actionTextActive: {
    color: '#E63946',
  },
})
