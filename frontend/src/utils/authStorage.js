const STORAGE_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  user: "auth_user",
  gym: "auth_gym",
};

export function saveAuthData(data) {
  localStorage.setItem(
    STORAGE_KEYS.accessToken,
    data.access
  );

  localStorage.setItem(
    STORAGE_KEYS.refreshToken,
    data.refresh
  );

  localStorage.setItem(
    STORAGE_KEYS.user,
    JSON.stringify(data.user || {})
  );

  localStorage.setItem(
    STORAGE_KEYS.gym,
    JSON.stringify(data.gym || {})
  );
}

export function saveTokens(accessToken, refreshToken) {
  localStorage.setItem(
    STORAGE_KEYS.accessToken,
    accessToken
  );

  localStorage.setItem(
    STORAGE_KEYS.refreshToken,
    refreshToken
  );
}

export function clearAuthData() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

export function getAccessToken() {
  return localStorage.getItem(
    STORAGE_KEYS.accessToken
  );
}

export function getRefreshToken() {
  return localStorage.getItem(
    STORAGE_KEYS.refreshToken
  );
}

function getStoredObject(key) {
  try {
    const storedValue = localStorage.getItem(key);

    return storedValue
      ? JSON.parse(storedValue)
      : null;
  } catch {
    return null;
  }
}

export function getCurrentUser() {
  return getStoredObject(STORAGE_KEYS.user);
}

export function getCurrentGym() {
  return getStoredObject(STORAGE_KEYS.gym);
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}