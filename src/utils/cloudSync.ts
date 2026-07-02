// utils/cloudSync.ts
// 通过云开发 HTTP API 调云函数 pokerSync 和 adminAuth
// 需要 Vercel 环境变量 VITE_CLOUD_ENV_ID（如 cloudbase-xxx）

const CLOUD_ENV = (import.meta as any).env?.VITE_CLOUD_ENV_ID || '';
const AUTH_URL = CLOUD_ENV ? `https://${CLOUD_ENV}.service.tcloudbase.com/adminAuth` : '';
const STATE_URL = CLOUD_ENV ? `https://${CLOUD_ENV}.service.tcloudbase.com/pokerSync` : '';

export const isCloudEnabled = (): boolean => Boolean(CLOUD_ENV && AUTH_URL && STATE_URL);

export interface CloudSession {
  sessionId: string;
  username: string;
  expiresAt: number;
}

export interface CloudState {
  levels: any[];
  currentLevelIndex: number;
  startedAt: number;
  levelStartAt: number;
  pausedAt: number;
  isRunning: boolean;
  settings: any;
  updatedAt: number;
}

const SESSION_KEY = 'poker-timer-cloud-session-v1';

const call = async (url: string, body: any): Promise<any> => {
  if (!isCloudEnabled()) {
    throw new Error('云开发未配置：设置 VITE_CLOUD_ENV_ID 环境变量');
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Cloud call failed: ${res.status}`);
  return res.json();
};

// ============== 鉴权 ==============

export const cloudLogin = async (username: string, password: string): Promise<CloudSession> => {
  const r = await call(AUTH_URL, { action: 'login', username, password });
  if (!r.success) throw new Error(r.errMsg || '登录失败');
  const session: CloudSession = {
    sessionId: r.sessionId,
    username: r.username,
    expiresAt: r.expiresAt,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

export const cloudRegister = async (username: string, password: string): Promise<void> => {
  const r = await call(AUTH_URL, { action: 'register', username, password });
  if (!r.success) throw new Error(r.errMsg || '注册失败');
};

export const cloudChangePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  const r = await call(AUTH_URL, { action: 'changePassword', oldPassword, newPassword });
  if (!r.success) throw new Error(r.errMsg || '修改失败');
};

export const cloudVerify = async (): Promise<CloudSession | null> => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  let session: CloudSession;
  try { session = JSON.parse(raw); } catch { return null; }
  if (Date.now() > session.expiresAt) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
  if (!isCloudEnabled()) return session;
  try {
    const r = await call(AUTH_URL, { action: 'verify', sessionId: session.sessionId });
    if (r.success) return session;
    localStorage.removeItem(SESSION_KEY);
    return null;
  } catch {
    return session;  // 网络错误时保留本地 session
  }
};

export const cloudLogout = (): void => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw) {
    try {
      const s: CloudSession = JSON.parse(raw);
      // 异步通知云端（不 await，失败忽略）
      call(AUTH_URL, { action: 'logout', sessionId: s.sessionId }).catch(() => {});
    } catch {}
  }
  localStorage.removeItem(SESSION_KEY);
};

export const getStoredSession = (): CloudSession | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const s: CloudSession = JSON.parse(raw);
    if (Date.now() > s.expiresAt) return null;
    return s;
  } catch {
    return null;
  }
};

// ============== 状态读写 ==============

export const cloudGetState = async (storeId = 'default'): Promise<CloudState | null> => {
  if (!isCloudEnabled()) return null;
  try {
    const r = await call(STATE_URL, { action: 'get', storeId });
    if (r.success) return r.data;
    return null;
  } catch {
    return null;
  }
};

const requireSession = (): CloudSession => {
  const s = getStoredSession();
  if (!s) throw new Error('未登录或 session 已过期');
  return s;
};

export const cloudSetState = async (state: Partial<CloudState>, storeId = 'default'): Promise<boolean> => {
  if (!isCloudEnabled()) return false;
  const s = requireSession();
  try {
    const r = await call(STATE_URL, { action: 'set', sessionId: s.sessionId, storeId, ...state });
    return r.success;
  } catch (e) {
    console.error('cloudSetState failed:', e);
    return false;
  }
};

export const cloudSetSettings = async (settings: any, storeId = 'default'): Promise<boolean> => {
  if (!isCloudEnabled()) return false;
  const s = requireSession();
  try {
    const r = await call(STATE_URL, { action: 'setSettings', sessionId: s.sessionId, storeId, settings });
    return r.success;
  } catch (e) {
    console.error('cloudSetSettings failed:', e);
    return false;
  }
};

export const cloudSetLevels = async (levels: any[], storeId = 'default'): Promise<boolean> => {
  if (!isCloudEnabled()) return false;
  const s = requireSession();
  try {
    const r = await call(STATE_URL, { action: 'setLevels', sessionId: s.sessionId, storeId, levels });
    return r.success;
  } catch (e) {
    console.error('cloudSetLevels failed:', e);
    return false;
  }
};
