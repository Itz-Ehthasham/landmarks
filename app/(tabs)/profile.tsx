import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../../contexts/AuthContext";
import { deletePost, fetchProfile, fetchUserPosts, getAvatarPublicUrl, getPostImagePublicUrl, updatePost } from "../../lib/profile";

// Samsung One UI colors
const COLORS = {
  primary: "#0072DE",
  accent: "#3E91FF",
  background: "#F5F6F8",
  surface: "#FFFFFF",
  textPrimary: "#191919",
  textSecondary: "#6B6B70",
  textTertiary: "#8E8E93",
  divider: "#E8E8ED",
  error: "#DF3333",
};

interface Post {
  id: string;
  image_url: string;
  park_name: string;
  caption: string | null;
  created_at: string;
}

interface Profile {
  username: string;
  bio: string | null;
  avatar_url: string | null;
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCaption, setEditingCaption] = useState("");
  const [editingSaving, setEditingSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
      }

      const postsData = await fetchUserPosts(user.id);
      setPosts(postsData);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
    setLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePostLongPress = (post: Post) => {
    setSelectedPost(post);
    setEditingCaption(post.caption || "");
    setShowModal(true);
  };

  const handleEditPost = async () => {
    if (!selectedPost) return;
    setEditingSaving(true);

    try {
      const { error } = await updatePost(selectedPost.id, {
        caption: editingCaption.trim(),
      });

      if (error) {
        Alert.alert("Error", "Failed to update post");
      } else {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === selectedPost.id
              ? { ...p, caption: editingCaption.trim() }
              : p
          )
        );
        setShowModal(false);
        Alert.alert("Success", "Post updated");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update post");
      console.error(error);
    }
    setEditingSaving(false);
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;

    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await deletePost(selectedPost.id);
            if (error) {
              Alert.alert("Error", "Failed to delete post");
            } else {
              setPosts((prev) => prev.filter((p) => p.id !== selectedPost.id));
              setShowModal(false);
              Alert.alert("Success", "Post deleted");
            }
          } catch (error) {
            Alert.alert("Error", "Failed to delete post");
            console.error(error);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const postCount = posts.length;
  const avatarUrl = profile?.avatar_url
    ? getAvatarPublicUrl(profile.avatar_url)
    : null;

  const renderPost = ({ item }: { item: Post }) => {
    const imageUrl = getPostImagePublicUrl(item.image_url);

    return (
      <TouchableOpacity
        style={styles.postGridItem}
        onLongPress={() => handlePostLongPress(item)}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.postImage} />
        ) : (
          <View style={[styles.postImage, styles.placeholderImage]}>
            <Ionicons name="image" size={32} color={COLORS.textTertiary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        scrollEventThrottle={16}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons
                      name="person"
                      size={40}
                      color={COLORS.textTertiary}
                    />
                  </View>
                )}
              </View>

              {/* Username & Bio */}
              <View style={styles.profileInfo}>
                <Text style={styles.username}>{profile?.username}</Text>
                <Text style={styles.bio}>{profile?.bio || ""}</Text>
              </View>

              {/* Settings Button */}
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => router.push("../profile_edit")}
              >
                <Ionicons name="settings" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Stats Section */}
            <View style={styles.statsSection}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{postCount}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            {/* Posts Header */}
            <View style={styles.postsHeader}>
              <Ionicons
                name="grid"
                size={16}
                color={COLORS.textSecondary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.postsTitle}>Posts</Text>
            </View>
          </View>
        }
        renderItem={renderPost}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="image"
              size={48}
              color={COLORS.textTertiary}
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.emptyText}>No posts yet</Text>
          </View>
        }
      />

      {/* Edit/Delete Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Post</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={COLORS.textPrimary}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {selectedPost?.image_url && (
                  <Image
                    source={{
                      uri: getPostImagePublicUrl(selectedPost.image_url) ?? undefined,
                    }}
                    style={styles.modalImage}
                  />
                )}

                <Text style={styles.modalLabel}>Caption</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Edit caption..."
                  value={editingCaption}
                  onChangeText={setEditingCaption}
                  multiline
                  placeholderTextColor={COLORS.textTertiary}
                />

                <Text style={styles.postTitle}>{selectedPost?.park_name}</Text>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={handleDeletePost}
                  disabled={editingSaving}
                >
                  <Ionicons name="trash" size={18} color="#fff" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.updateButton]}
                  onPress={handleEditPost}
                  disabled={editingSaving}
                >
                  {editingSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={18} color="#fff" />
                      <Text style={styles.updateButtonText}>Update</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },

  // Header Styles
  header: {
    backgroundColor: COLORS.surface,
    paddingBottom: 16,
    borderBottomColor: COLORS.divider,
    borderBottomWidth: 1,
  },

  profileSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },

  avatarContainer: {
    marginRight: 16,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
  },

  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },

  profileInfo: {
    flex: 1,
    paddingTop: 4,
  },

  username: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },

  bio: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  settingsButton: {
    padding: 8,
    marginTop: -8,
  },

  // Stats Section
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopColor: COLORS.divider,
    borderTopWidth: 1,
  },

  statItem: {
    alignItems: "center",
    flex: 1,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.divider,
  },

  // Posts Header
  postsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  postsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  // Grid Styles
  columnWrapper: {
    paddingHorizontal: 8,
    marginBottom: 8,
  },

  postGridItem: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.background,
  },

  postImage: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: COLORS.background,
  },

  placeholderImage: {
    alignItems: "center",
    justifyContent: "center",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },

  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    overflow: "hidden",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomColor: COLORS.divider,
    borderBottomWidth: 1,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: "60%",
  },

  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },

  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  modalInput: {
    borderColor: COLORS.divider,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },

  postTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  modalFooter: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopColor: COLORS.divider,
    borderTopWidth: 1,
  },

  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },

  deleteButton: {
    backgroundColor: COLORS.error,
  },

  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  updateButton: {
    backgroundColor: COLORS.primary,
  },

  updateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
