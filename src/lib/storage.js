import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  token: "token",
  userId: "userId",
  user: "user",
};

export const storageKeys = KEYS;

export async function getStoredAuth() {
  const [token, userId, userRaw] = await Promise.all([
    AsyncStorage.getItem(KEYS.token),
    AsyncStorage.getItem(KEYS.userId),
    AsyncStorage.getItem(KEYS.user),
  ]);

  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch (error) {
      user = null;
    }
  }

  return { token, userId, user };
}

export async function setStoredAuth({ token, user }) {
  const updates = [];

  if (token) {
    updates.push([KEYS.token, token]);
  }

  if (user?.id != null) {
    updates.push([KEYS.userId, String(user.id)]);
  }

  if (user) {
    updates.push([KEYS.user, JSON.stringify(user)]);
  }

  if (updates.length) {
    await AsyncStorage.multiSet(updates);
  }
}

export async function clearStoredAuth() {
  await AsyncStorage.multiRemove([KEYS.token, KEYS.userId, KEYS.user]);
}
