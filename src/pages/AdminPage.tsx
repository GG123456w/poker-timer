import React, { useState, useEffect } from 'react';
import { useTimer } from '../contexts/TimerContext';
import { Maximize, Minimize, ArrowLeft, LogOut, User, KeyRound, X, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { logout, getSession, changePassword } from '../utils/auth';
import { cloudLogout, cloudChangePassword, isCloudEnabled } from '../utils/cloudSync';

const formatTime = (s: number): string => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const AdminPage: React.FC = () => {
  const { state, start, pause, reset, prev, skip, setLevels, updateSettings, getDerived } = useTimer();
  const { settings, levels, currentLevelIndex, isRunning } = state;
  const { levelRemaining, levelUsed } = getDerived();
  const currentLevel = levels[currentLevelIndex];
  const nextLevel = levels[currentLevelIndex + 1];
  const isWarning = levelRemaining > 0 && levelRemaining <= settings.warningSeconds;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [newPwd2, setNewPwd2] = useState('');
  const [showOldPwd, setShowOldPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [session] = useState(() => getSession());

  // 初始设置 - 盲注结构生成器
  const [localConfig, setLocalConfig] = useState({
    startSB: 100,
    startBB: 200,
    duration: 15,
    levelCount: 24,
    multiplier: 2,
  });

  // 赛事中途调整 - 4 个操作的本地输入
  const [addPlayers, setAddPlayers] = useState(0);
  const [eliminatePlayers, setEliminatePlayers] = useState(0);
  const [addChips, setAddChips] = useState(0);
  const [deductChips, setDeductChips] = useState(0);
  const [adjMsg, setAdjMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // 加载 localStorage 中的盲注配置
  useEffect(() => {
    const saved = localStorage.getItem('admin_blind_config');
    if (saved) {
      try { setLocalConfig(JSON.parse(saved)); } catch {}
    }
  }, []);

  // 3 秒后自动清除提示
  useEffect(() => {
    if (adjMsg) {
      const id = setTimeout(() => setAdjMsg(null), 3000);
      return () => clearTimeout(id);
    }
  }, [adjMsg]);

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      cloudLogout();
      logout();
      window.location.hash = '#/admin';
      window.location.reload();
    }
  };

  const openChangePwd = () => {
    setOldPwd(''); setNewPwd(''); setNewPwd2('');
    setPwdError(''); setPwdSuccess('');
    setShowChangePwd(true);
  };

  const closeChangePwd = () => {
    setShowChangePwd(false);
    setPwdError(''); setPwdSuccess('');
  };

  const submitChangePwd = async () => {
    setPwdError(''); setPwdSuccess('');
    if (!oldPwd || !newPwd || !newPwd2) {
      setPwdError('请填写完整');
      return;
    }
    if (newPwd !== newPwd2) {
      setPwdError('两次输入的新密码不一致');
      return;
    }
    if (newPwd.length < 6) {
      setPwdError('新密码至少 6 位');
      return;
    }
    setPwdLoading(true);
    try {
      if (isCloudEnabled()) {
        await cloudChangePassword(oldPwd, newPwd);
      } else {
        const r = changePassword(oldPwd, newPwd);
        if (!r.ok) throw new Error(r.error || '修改失败');
      }
      setPwdSuccess('密码修改成功！请使用新密码重新登录。');
      setTimeout(() => {
        cloudLogout();
        logout();
        window.location.hash = '#/admin';
        window.location.reload();
      }, 1500);
    } catch (e: any) {
      setPwdError(e.message || '修改失败');
    } finally {
      setPwdLoading(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const onApplyConfig = () => {
    let sb = localConfig.startSB;
    let bb = localConfig.startBB;
    const newLevels = [];
    for (let i = 1; i <= localConfig.levelCount; i++) {
      newLevels.push({
        id: Math.random().toString(36).substr(2, 9),
        level: i,
        smallBlind: sb,
        bigBlind: bb,
        ante: 0,
        duration: localConfig.duration,
        isBreak: false,
      });
      sb = Math.floor(sb * localConfig.multiplier);
      bb = sb * 2;
    }
    setLevels(newLevels);
    localStorage.setItem('admin_blind_config', JSON.stringify(localConfig));
    setAdjMsg({ type: 'success', text: `已生成 ${newLevels.length} 个盲注级别` });
  };

  // ===== 赛事中途调整 - 4 个操作 =====

  // 1. 中途新增参赛人数：+N 人，参赛人数 +N，剩余人数 +N，总积分 += N * 当前平均
  const handleAddPlayers = () => {
    if (addPlayers <= 0) {
      setAdjMsg({ type: 'error', text: '请输入大于 0 的数字' });
      return;
    }
    const avg = settings.remainingCount > 0
      ? Math.floor(settings.totalChips / settings.remainingCount)
      : Math.floor(settings.totalChips / Math.max(1, settings.entrantCount));
    const newEntrants = settings.entrantCount + addPlayers;
    const newRemaining = settings.remainingCount + addPlayers;
    const newTotal = settings.totalChips + avg * addPlayers;
    updateSettings({
      entrantCount: newEntrants,
      remainingCount: newRemaining,
      totalChips: newTotal,
    });
    setAdjMsg({ type: 'success', text: `新增 ${addPlayers} 人，每人发放 ${avg.toLocaleString()} 筹码，总积分 +${(avg * addPlayers).toLocaleString()}` });
    setAddPlayers(0);
  };

  // 2. 淘汰减少人数：-N 人，仅剩余人数 -N，总积分不变
  const handleEliminate = () => {
    if (eliminatePlayers <= 0) {
      setAdjMsg({ type: 'error', text: '请输入大于 0 的数字' });
      return;
    }
    if (eliminatePlayers > settings.remainingCount) {
      setAdjMsg({ type: 'error', text: `淘汰人数不能超过当前剩余人数 ${settings.remainingCount}` });
      return;
    }
    updateSettings({
      remainingCount: settings.remainingCount - eliminatePlayers,
    });
    setAdjMsg({ type: 'success', text: `淘汰 ${eliminatePlayers} 人，剩余 ${settings.remainingCount - eliminatePlayers} 人` });
    setEliminatePlayers(0);
  };

  // 3. 中途增加积分（重购）：+N 积分，总积分 += N，人数不变
  const handleAddChips = () => {
    if (addChips <= 0) {
      setAdjMsg({ type: 'error', text: '请输入大于 0 的数字' });
      return;
    }
    updateSettings({
      totalChips: settings.totalChips + addChips,
    });
    setAdjMsg({ type: 'success', text: `重购积分 +${addChips.toLocaleString()}` });
    setAddChips(0);
  };

  // 4. 中途扣除积分（修正）：-N 积分，总积分 -= N，人数不变
  const handleDeductChips = () => {
    if (deductChips <= 0) {
      setAdjMsg({ type: 'error', text: '请输入大于 0 的数字' });
      return;
    }
    if (deductChips > settings.totalChips) {
      setAdjMsg({ type: 'error', text: `扣除积分不能超过当前总积分 ${settings.totalChips.toLocaleString()}` });
      return;
    }
    updateSettings({
      totalChips: settings.totalChips - deductChips,
    });
    setAdjMsg({ type: 'success', text: `修正扣除 -${deductChips.toLocaleString()}` });
    setDeductChips(0);
  };

  // 当前平均记分牌（投屏页显示逻辑一致：总积分 / 剩余人数）
  const avgChips = settings.remainingCount > 0
    ? Math.floor(settings.totalChips / settings.remainingCount)
    : 0;

  return (
    <div className="min-h-screen w-full text-white" style={{ background: 'linear-gradient(180deg, #1a1410 0%, #050302 100%)' }}>
      {/* 顶部 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button onClick={() => window.location.hash = '/'} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/20 rounded text-sm">
            <ArrowLeft size={16} /> 返回投屏
          </button>
          {session && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded text-sm">
              <User size={14} className="text-amber-500" />
              <span className="text-amber-500 font-medium">{session.username}</span>
            </div>
          )}
        </div>
        <h1 className="text-xl font-bold tracking-wider" style={{ color: '#c5a572' }}>本地管理后台</h1>
        <div className="flex items-center gap-2">
          <button onClick={openChangePwd} className="flex items-center gap-2 px-3 py-1.5 bg-amber-900/30 border border-amber-700/50 hover:bg-amber-900/50 rounded text-sm">
            <KeyRound size={16} /> 修改密码
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 border border-red-700/50 hover:bg-red-900/50 rounded text-sm">
            <LogOut size={16} /> 退出登录
          </button>
          <button onClick={toggleFullscreen} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/20 rounded text-sm">
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />} {isFullscreen ? '退出全屏' : '全屏'}
          </button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* 倒计时 + 状态（与前台一致：本级别剩余时间） */}
        <div
          className="rounded-2xl p-6 text-center relative overflow-hidden"
          style={{
            background: 'rgba(15, 15, 15, 0.7)',
            border: `1px solid ${isWarning ? 'rgba(239, 68, 68, 0.5)' : 'rgba(251, 191, 36, 0.3)'}`,
            boxShadow: isWarning
              ? '0 0 30px rgba(239, 68, 68, 0.3)'
              : '0 0 30px rgba(251, 191, 36, 0.1)',
          }}
        >
          <div className="text-sm text-gray-400 mb-2">
            LEVEL {currentLevel?.level || 0} / {levels.length} ·{' '}
            {currentLevel ? `${currentLevel.smallBlind}/${currentLevel.bigBlind}` : '--'}
          </div>
          <div
            className="font-mono font-bold leading-none"
            style={{
              fontSize: 'clamp(5rem, 12vw, 9rem)',
              color: isWarning ? '#ef4444' : (settings.countdownColor || '#fbbf24'),
              textShadow: isWarning
                ? '0 0 30px rgba(239, 68, 68, 0.6), 0 0 15px rgba(239, 68, 68, 0.4)'
                : `0 0 30px ${settings.countdownColor || '#fbbf24'}80, 0 0 15px ${settings.countdownColor || '#fbbf24'}60`,
              fontFamily: 'Consolas, Monaco, monospace',
            }}
          >
            {formatTime(levelRemaining)}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            状态：{isRunning ? '⏱️ 计时中' : '⏸️ 已暂停'} · 本级用时 {formatTime(levelUsed)} / {currentLevel?.duration || 0}:00
          </div>
        </div>

        {/* 主控制按钮 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {!isRunning ? (
            <button onClick={start} className="py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg text-lg">▶ 开始</button>
          ) : (
            <button onClick={pause} className="py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg text-lg">⏸ 暂停</button>
          )}
          <button onClick={prev} className="py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg">← 上一级</button>
          <button onClick={skip} className="py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg">下一级 →</button>
          <button onClick={reset} className="py-3 bg-red-900/50 hover:bg-red-900/70 border border-red-700 rounded-lg">⟲ 重置</button>
        </div>

        {/* 操作提示 */}
        {adjMsg && (
          <div className={`rounded-lg px-4 py-2.5 text-sm text-center font-medium ${adjMsg.type === 'success'
            ? 'bg-green-500/10 border border-green-500/50 text-green-300'
            : 'bg-red-500/10 border border-red-500/50 text-red-300'}`}>
            {adjMsg.text}
          </div>
        )}

        {/* ===== 初始设置（合并原"比赛数据"+"盲注结构"，删除"满员"） ===== */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#c5a572' }}>初始设置</h2>
            <p className="text-xs text-gray-500 mt-1">比赛开始前的初始数据与盲注结构（修改后立即生效）</p>
          </div>

          {/* 比赛数据 */}
          <div>
            <div className="text-xs text-gray-400 mb-2 font-medium">比赛数据</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-400">参赛人数</label>
                <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center text-xl font-bold" type="number" value={settings.entrantCount} onChange={e => updateSettings({ entrantCount: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-gray-400">剩余人数</label>
                <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center text-xl font-bold" type="number" value={settings.remainingCount} onChange={e => updateSettings({ remainingCount: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-gray-400">总记分牌</label>
                <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center text-xl font-bold" type="number" value={settings.totalChips} onChange={e => updateSettings({ totalChips: Number(e.target.value) })} />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">
              平均记分牌 = 总记分牌 / 剩余人数 = {avgChips.toLocaleString()}
            </div>
          </div>

          {/* 倒计时与报名状态 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400">警告秒数（最后几秒变红）</label>
              <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center" type="number" value={settings.warningSeconds} onChange={e => updateSettings({ warningSeconds: Number(e.target.value) })} />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => updateSettings({ isRegistrationClosed: !settings.isRegistrationClosed })}
                className={`w-full py-2.5 rounded-lg font-bold ${settings.isRegistrationClosed ? 'bg-red-700 hover:bg-red-600' : 'bg-green-700 hover:bg-green-600'}`}
              >
                {settings.isRegistrationClosed ? '已停止报名' : '接受报名中'}
              </button>
            </div>
          </div>

          {/* 主屏显示设置 */}
          <div className="pt-3 border-t border-white/10">
            <div className="text-xs text-gray-400 mb-2 font-medium">主屏显示设置</div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">大标题（投屏页顶部）</label>
                <input
                  className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center text-lg"
                  value={settings.tournamentTitle || ''}
                  onChange={e => updateSettings({ tournamentTitle: e.target.value })}
                  placeholder="All in 酒馆"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">中央数字字号（80-360 px）</label>
                  <input
                    className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center"
                    type="number" min="80" max="360"
                    value={settings.countdownFontSize || 220}
                    onChange={e => updateSettings({ countdownFontSize: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">中央数字颜色</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      className="w-12 h-10 bg-black/40 border border-white/20 rounded"
                      value={settings.countdownColor || '#fbbf24'}
                      onChange={e => updateSettings({ countdownColor: e.target.value })}
                    />
                    <input
                      className="flex-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center font-mono"
                      value={settings.countdownColor || '#fbbf24'}
                      onChange={e => updateSettings({ countdownColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 盲注结构（生成器） */}
          <div className="pt-3 border-t border-white/10">
            <div className="text-xs text-gray-400 mb-2 font-medium">盲注结构（点击"应用"重新生成）</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="text-xs text-gray-400">起手小盲</label>
                <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center" type="number" value={localConfig.startSB} onChange={e => setLocalConfig({ ...localConfig, startSB: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-gray-400">起手大盲</label>
                <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center" type="number" value={localConfig.startBB} onChange={e => setLocalConfig({ ...localConfig, startBB: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-gray-400">每级分钟</label>
                <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center" type="number" value={localConfig.duration} onChange={e => setLocalConfig({ ...localConfig, duration: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-gray-400">总级数</label>
                <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center" type="number" value={localConfig.levelCount} onChange={e => setLocalConfig({ ...localConfig, levelCount: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-gray-400">升盲倍数</label>
                <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center" type="number" step="0.1" value={localConfig.multiplier} onChange={e => setLocalConfig({ ...localConfig, multiplier: Number(e.target.value) })} />
              </div>
            </div>
            <button onClick={onApplyConfig} className="w-full mt-3 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg">应用盲注结构</button>
            <div className="text-xs text-gray-500 mt-2 text-center">当前共 {levels.length} 个级别 · {currentLevel ? `当前 ${currentLevel.smallBlind}/${currentLevel.bigBlind}` : ''} {nextLevel ? `· 下一 ${nextLevel.smallBlind}/${nextLevel.bigBlind}` : ''}</div>
          </div>
        </div>

        {/* ===== 赛事中途动态调整（参考图） ===== */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <RefreshCw size={18} style={{ color: '#c5a572' }} />
            <h2 className="text-base font-semibold" style={{ color: '#c5a572' }}>赛事中途动态调整（实时生效）</h2>
          </div>

          {/* 1. 中途新增参赛人数（绿） */}
          <div className="grid grid-cols-[120px_1fr_auto] items-start gap-4">
            <label className="text-sm pt-2">中途新增参赛人数</label>
            <div>
              <input
                type="number"
                min="0"
                value={addPlayers || ''}
                onChange={e => setAddPlayers(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-2xl font-bold text-center"
              />
              <div className="text-xs text-gray-500 mt-1.5">新增玩家自动发放当前平均记分牌数额，总积分实时累加</div>
            </div>
            <button
              onClick={handleAddPlayers}
              className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold rounded-lg shadow-lg"
            >
              确认新增
            </button>
          </div>

          {/* 2. 淘汰减少人数（橙） */}
          <div className="grid grid-cols-[120px_1fr_auto] items-start gap-4">
            <label className="text-sm pt-2">淘汰减少人数</label>
            <div>
              <input
                type="number"
                min="0"
                value={eliminatePlayers || ''}
                onChange={e => setEliminatePlayers(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-2xl font-bold text-center"
              />
              <div className="text-xs text-gray-500 mt-1.5">仅减少参赛人数，总积分不变</div>
            </div>
            <button
              onClick={handleEliminate}
              className="px-8 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-lg shadow-lg"
            >
              确认扣除
            </button>
          </div>

          {/* 3. 中途增加积分（重购）（绿） */}
          <div className="grid grid-cols-[120px_1fr_auto] items-start gap-4">
            <label className="text-sm pt-2">中途增加积分（重购）</label>
            <div>
              <input
                type="number"
                min="0"
                value={addChips || ''}
                onChange={e => setAddChips(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-2xl font-bold text-center"
              />
              <div className="text-xs text-gray-500 mt-1.5">只增加总积分，人数不变</div>
            </div>
            <button
              onClick={handleAddChips}
              className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-lg shadow-lg"
            >
              确认增加
            </button>
          </div>

          {/* 4. 中途扣除积分（修正）（红） */}
          <div className="grid grid-cols-[120px_1fr_auto] items-start gap-4">
            <label className="text-sm pt-2">中途扣除 积分（修正）</label>
            <div>
              <input
                type="number"
                min="0"
                value={deductChips || ''}
                onChange={e => setDeductChips(Number(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-black/40 border border-white/20 rounded text-2xl font-bold text-center"
              />
              <div className="text-xs text-gray-500 mt-1.5">仅用于数据录入错误修正</div>
            </div>
            <button
              onClick={handleDeductChips}
              className="px-8 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-lg shadow-lg"
            >
              确认扣除
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          💡 提示：投屏电脑浏览器打开投屏页，本页面作为本地控制后台。两者自动实时同步。
        </div>
      </div>

      {/* 修改密码模态框 */}
      {showChangePwd && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={closeChangePwd}
        >
          <div
            className="bg-gray-900 border border-amber-700/50 rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeChangePwd}
              className="absolute top-3 right-3 text-gray-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">修改管理员密码</h2>
                <p className="text-xs text-gray-400 mt-0.5">修改后需重新登录</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">旧密码</label>
                <div className="relative">
                  <input
                    type={showOldPwd ? 'text' : 'password'}
                    value={oldPwd}
                    onChange={(e) => setOldPwd(e.target.value)}
                    placeholder="请输入当前密码"
                    className="w-full px-3 py-2.5 pr-10 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPwd(!showOldPwd)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500"
                  >
                    {showOldPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">新密码（至少 6 位）</label>
                <div className="relative">
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="请输入新密码"
                    className="w-full px-3 py-2.5 pr-10 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none transition-all"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd(!showNewPwd)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500"
                  >
                    {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">确认新密码</label>
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  value={newPwd2}
                  onChange={(e) => setNewPwd2(e.target.value)}
                  placeholder="再次输入新密码"
                  className="w-full px-3 py-2.5 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none transition-all"
                  autoComplete="new-password"
                />
              </div>

              {pwdError && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-3 py-2 text-red-400 text-sm text-center">
                  {pwdError}
                </div>
              )}
              {pwdSuccess && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg px-3 py-2 text-green-400 text-sm text-center">
                  {pwdSuccess}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={closeChangePwd}
                  className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  disabled={pwdLoading}
                >
                  取消
                </button>
                <button
                  onClick={submitChangePwd}
                  disabled={pwdLoading || !!pwdSuccess}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pwdLoading ? '修改中...' : '确认修改'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
