// 本地鉴权（前端 hash 校验，安全性有限，但能阻挡普通用户）
// 生产环境建议接入真正的后端鉴权（云开发 / Auth0 / Supabase Auth）

const AUTH_KEY = 'poker-timer-auth-v1';
const CRED_KEY = 'poker-timer-cred-v1';

// 简易 hash 函数（仅防明文存储，生产环境用 bcrypt/argon2）
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const salt = 'poker-timer-2026';
  const combined = str + salt;
  let h = 0;
  for (let i = 0; i < combined.length; i++) {
    h = ((h << 5) - h) + combined.charCodeAt(i);
    h = h & h;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + Math.abs(h).toString(36);
};

// 默认凭据（仅首次使用，修改后会写入 localStorage）
const DEFAULT = { username: 'admin', password: 'admin888' };

// 读取当前凭据（localStorage 优先）
const getCredHash = (): { username: string; password: string } => {
  try {
    const raw = localStorage.getItem(CRED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // 首次使用：写入默认值
  const def = {
    username: simpleHash(DEFAULT.username),
    password: simpleHash(DEFAULT.password),
  };
  localStorage.setItem(CRED_KEY, JSON.stringify(def));
  return def;
};

export const DEFAULT_USERNAME = DEFAULT.username;

export interface AuthSession {
  username: string;
  loginAt: number;
  expiresAt: number;
}

const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 天

export const login = (username: string, password: string): boolean => {
  const cred = getCredHash();
  const u = simpleHash(username);
  const p = simpleHash(password);
  if (u === cred.username && p === cred.password) {
    const session: AuthSession = {
      username,
      loginAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return true;
  }
  return false;
};

export const logout = (): void => {
  localStorage.removeItem(AUTH_KEY);
};

export const getSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(AUTH_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const isLoggedIn = (): boolean => {
  return getSession() !== null;
};

// 修改密码（需要验证旧密码）
export const changePassword = (oldPassword: string, newPassword: string): { ok: boolean; error?: string } => {
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: '新密码至少 6 位' };
  }
  const cred = getCredHash();
  if (simpleHash(oldPassword) !== cred.password) {
    return { ok: false, error: '旧密码错误' };
  }
  const newCred = {
    username: cred.username, // 用户名不修改
    password: simpleHash(newPassword),
  };
  localStorage.setItem(CRED_KEY, JSON.stringify(newCred));
  return { ok: true };
};
