import { useFocusEffect, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useCallback, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CommentSheet from '../../components/CommentSheet'
import PostCard from '../../components/PostCard'
import { useAuth } from '../../contexts/AuthContext'
import { fetchHomeFeed, PostWithDetails } from '../../lib/postsData'
import { fetchProfile, Profile } from '../../lib/profile'

export default function HomeScreen() {
  const { user } = useAuth()
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(null)
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    if (user) {
      loadProfile()
      loadFeed()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    const userProfile = await fetchProfile(user.id)
    setProfile(userProfile)
  }

  const loadFeed = async (reset = false) => {
    if (!user) return

    try {
      const newOffset = reset ? 0 : offset
      const feedPosts = await fetchHomeFeed(user.id, 10, newOffset)

      if (reset) {
        setPosts(feedPosts)
        setOffset(feedPosts.length)
      } else {
        setPosts((prev) => {
          // Filter out any duplicates that might already exist
          const existingIds = new Set(prev.map(p => p.id))
          const newPosts = feedPosts.filter(p => !existingIds.has(p.id))
          return [...prev, ...newPosts]
        })
        setOffset((prevOffset) => prevOffset + feedPosts.length)
      }

      setHasMore(feedPosts.length === 10)
      setIsLoading(false)
      setIsRefreshing(false)
    } catch (error) {
      console.error('Error loading feed:', error)
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadFeed(true)
        setOffset(0)
      }
    }, [user])
  )

  const handleRefresh = () => {
    setIsRefreshing(true)
    setOffset(0)
    loadFeed(true)
  }

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadFeed(false)
    }
  }

  const handleCommentPress = (post: PostWithDetails) => {
    setSelectedPost(post)
    setShowComments(true)
  }

  const handleUserNamePress = (userId: string, username: string) => {
    navigation.navigate('PublicProfile', { userId, username })
  }

  const handleLikeChange = (postId: string, liked: boolean) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              user_liked: liked,
              likes_count: liked
                ? p.likes_count + 1
                : Math.max(0, p.likes_count - 1),
            }
          : p
      )
    )
  }

  const renderPost = ({ item }: { item: PostWithDetails }) => (
    <PostCard
      post={item}
      currentUserId={user?.id || ''}
      onCommentPress={handleCommentPress}
      onUserNamePress={handleUserNamePress}
      onLikeChange={handleLikeChange}
    />
  )

  if (isLoading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>
                Be the first to share a landmark!
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading && posts.length > 0 ? (
            <ActivityIndicator
              size="large"
              color="#0066cc"
              style={styles.footerLoader}
            />
          ) : null
        }
      />

      {selectedPost && profile && (
        <CommentSheet
          post={selectedPost}
          currentUserId={user?.id || ''}
          currentUserUsername={profile.username || 'Unknown'}
          isVisible={showComments}
          onClose={() => setShowComments(false)}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  footerLoader: {
    marginVertical: 16,
  },
})
