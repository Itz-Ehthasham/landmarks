import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Landmarks!</Text>
      <Text style={styles.subtitle}>
        Discover and share amazing Indian national parks
      </Text>
      <Text style={styles.email}>{user?.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F2F2F7",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
  },
});
