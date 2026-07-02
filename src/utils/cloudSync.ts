// utils/cloudSync.ts
// 跨设备同步：通过微信云开发 HTTP API 调用云函数 pokerSync
// 文档：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions/

const CLOUD_ENV = (import.meta as any).env?.VITE_CLOUD_ENV_ID || '';

// HTTP 触发器地址（云函数开启 HTTP 触发后）
// 格式：https://${envId}.service.tcloudbase.com/${functionName}
const CLOUD_URL = CLOUD_ENV
  ? `https://${CLOUD_ENV}.service.tcloudbase.com/pokerSync`
  : '';

export interface CloudState {
  levels: any[];
  currentLevelIndex: number;
  startedAt: number;
  levelStartAt: number;
  pausedAt: number;
  isRunning: boolean;
  settings: any;
  serverTime: number;
  updatedAt: number;
}

export const isCloudEnabled = (): boolean => Boolean(CLOUD_URL);

const callCloud = async (body: any): Promise<any> => {
  if (!CLOUD_URL) {
    throw new Error('云开发未配置：设置 VITE_CLOUD_ENV_ID 环境变量');
  }
  const res = await fetch(CLOUD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Cloud call failed: ${res.status}`);
  return res.json();
};

export const pullFromCloud = async (storeId = 'default'): Promise<CloudState | null> => {
  if (!isCloudEnabled()) return null;
  const r = await callCloud({ action: 'get', storeId });
  if (r.success) return r.data;
  return null;
};

export const pushToCloud = async (state: any, storeId = 'default'): Promise<boolean> => {
  if (!isCloudEnabled()) return false;
  const r = await callCloud({ action: 'set', storeId, ...state });
  return r.success;
};

export const pushSettings = async (settings: any, storeId = 'default'): Promise<boolean> => {
  if (!isCloudEnabled()) return false;
  const r = await callCloud({ action: 'setSettings', storeId, settings });
  return r.success;
};

export const pushLevels = async (levels: any[], storeId = 'default'): Promise<boolean> => {
  if (!isCloudEnabled()) return false;
  const r = await callCloud({ action: 'setLevels', storeId, levels });
  return r.success;
};
