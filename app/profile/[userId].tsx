import { Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { fetchProfile, fetchUserPosts, getAvatarPublicUrl, getPostImagePublicUrl, Post, Profile } from '../../lib/profile'


export default function PublicProfileScreen() {
  const route = useRoute<any>()
  const navigation = useNavigation()
  const { userId, username } = route.params || {}

  const [profile, setProfile] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadProfile()
      loadPosts()
    }
  }, [userId])

  const loadProfile = async () => {
    const userProfile = await fetchProfile(userId)
    setProfile(userProfile)
  }

  const loadPosts = async () => {
    const userPosts = await fetchUserPosts(userId)
    setPosts(userPosts)
    setIsLoading(false)
  }

  const avatarUrl = profile ? getAvatarPublicUrl(profile.avatar_url) : null

  const renderPostThumbnail = ({ item }: { item: Post }) => {
    const imageUrl = getPostImagePublicUrl(item.image_url)
    return (
      <View style={styles.thumbnailContainer}>
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.thumbnail} />
        )}
        {!imageUrl && <View style={styles.thumbnailPlaceholder} />}
      </View>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color="#0066cc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{username}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-circle" size={80} color="#ddd" />
          </View>
        )}

        <View style={styles.profileInfo}>
          <Text style={styles.profileUsername}>
            {profile?.username || 'Unknown User'}
          </Text>
          {profile?.bio && <Text style={styles.profileBio}>{profile.bio}</Text>}

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Posts Grid */}
      <View style={styles.divider} />

      <Text style={styles.postsTitle}>Posts</Text>

      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="image-outline" size={48} color="#ddd" />
          <Text style={styles.emptyText}>No posts yet</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPostThumbnail}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          scrollEnabled={false}
        />
      )}
    </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  headerSpacer: {
    width: 28,
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileUsername: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  postsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  gridContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  thumbnailContainer: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: 4,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  thumbnail: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
})
