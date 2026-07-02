// 简单的本地鉴权（仅前端 hash 校验，安全性有限，但能阻挡普通用户）
// 生产环境强烈建议接入真正的后端鉴权（云开发 / Auth0 / Supabase Auth）

const AUTH_KEY = 'poker-timer-auth-v1';

// 简易 hash 函数（仅防明文存储，生产环境用 bcrypt/argon2）
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // 加上一个固定盐值混淆
  const salt = 'poker-timer-2026';
  const combined = str + salt;
  let h = 0;
  for (let i = 0; i < combined.length; i++) {
    h = ((h << 5) - h) + combined.charCodeAt(i);
    h = h & h;
  }
  return 'h_' + Math.abs(hash).toString(36) + '_' + Math.abs(h).toString(36);
};

// 默认账号密码（用户可在 src/utils/auth.ts 修改）
export const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: 'admin888',
};

// 凭据 hash（运行时计算一次）
const CRED_HASH = {
  username: simpleHash(DEFAULT_CREDENTIALS.username),
  password: simpleHash(DEFAULT_CREDENTIALS.password),
};

export interface AuthSession {
  username: string;
  loginAt: number;
  expiresAt: number;
}

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 天

export const login = (username: string, password: string): boolean => {
  const u = simpleHash(username);
  const p = simpleHash(password);
  if (u === CRED_HASH.username && p === CRED_HASH.password) {
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
