import type { BlindLevel } from '../types';

const generateId = (): string => Math.random().toString(36).substr(2, 9);

const createLevels = (config: { startSB: number; startBB: number; duration: number; levelCount: number; multiplier: number }): BlindLevel[] => {
  const levels: BlindLevel[] = [];
  let sb = config.startSB;
  let bb = config.startBB;

  for (let i = 1; i <= config.levelCount; i++) {
    levels.push({
      id: generateId(),
      level: i,
      smallBlind: sb,
      bigBlind: bb,
      ante: 0,
      duration: config.duration,
    });

    sb = Math.floor(sb * config.multiplier);
    bb = sb * 2;
  }

  return levels;
};

export const defaultTemplates = [
  {
    name: '标准锦标赛',
    description: '24个级别，每级15分钟',
    levels: createLevels({
      startSB: 100,
      startBB: 200,
      duration: 15,
      levelCount: 24,
      multiplier: 2,
    }),
  },
  {
    name: '快速锦标赛',
    description: '18个级别，每级8分钟',
    levels: createLevels({
      startSB: 200,
      startBB: 400,
      duration: 8,
      levelCount: 18,
      multiplier: 1.5,
    }),
  },
  {
    name: '深筹锦标赛',
    description: '30个级别，每级20分钟',
    levels: createLevels({
      startSB: 50,
      startBB: 100,
      duration: 20,
      levelCount: 30,
      multiplier: 1.5,
    }),
  },
];

export const defaultSettings = {
  isMuted: false,
  autoAdvance: true,
  warningSeconds: 10,
  isPaused: false,
  tournamentName: '9人标准局',
  clubName: '测试扑克俱乐部',
  eventTitle: '醉乐熊生存挑战赛',
  entrantCount: 9,
  maxEntrants: 9,
  startingChips: 20000,
  totalChips: 180000,
  avgChips: 20000,
  screenId: '1',
  isRegistrationClosed: true,
};
