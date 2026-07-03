export interface BlindLevel {
  id: string;
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  duration: number;
  isBreak?: boolean;
}

export interface TimerSettings {
  isMuted: boolean;
  autoAdvance: boolean;
  warningSeconds: number;
  isPaused: boolean;
  tournamentName: string;
  clubName: string;
  eventTitle: string;
  entrantCount: number;
  maxEntrants: number;
  startingChips: number;
  totalChips: number;
  avgChips: number;
  screenId: string;
  isRegistrationClosed: boolean;

  // ---- 样式可配置（参考图风格） ----
  tournamentTitle: string;     // 大标题 "All in 酒馆"
  countdownFontSize: number;   // 中央倒计时字号（默认 220）
  countdownColor: string;      // 倒计时颜色（默认 #fbbf24 金色）
  remainingCount: number;      // 剩余人数（左栏显示）
}

export interface TimerState {
  levels: BlindLevel[];
  currentLevelIndex: number;
  // 绝对时间基准（所有 tab 独立计算 elapsedTime，完全同步）
  startedAt: number;       // 比赛开始的 Date.now()（0 表示未开始）
  levelStartAt: number;    // 当前级别开始的 Date.now()（升级别不重置 startedAt）
  pausedAt: number;        // 暂停时的 Date.now()（0 表示未暂停）
  elapsedTime: number;     // 派生：当前已用秒数（渲染用）
  levelStartTotal: number; // 派生：当前级别开始时的 elapsedTime
  isRunning: boolean;
  settings: TimerSettings;
}
