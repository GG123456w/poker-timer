import React, { useState, useEffect } from 'react';
import { useTimer } from '../contexts/TimerContext';
import { Maximize, Minimize, ArrowLeft, LogOut, User } from 'lucide-react';
import { logout, getSession } from '../utils/auth';

const formatTime = (s: number): string => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const AdminPage: React.FC = () => {
  const { state, start, pause, reset, prev, skip, setLevels, updateSettings, getDerived } = useTimer();
  const { settings, levels, currentLevelIndex, isRunning } = state;
  const { elapsedTime } = getDerived();
  const currentLevel = levels[currentLevelIndex];
  const nextLevel = levels[currentLevelIndex + 1];
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [session, setSession] = useState(() => getSession());
  const [localConfig, setLocalConfig] = useState({
    startSB: 100,
    startBB: 200,
    duration: 15,
    levelCount: 24,
    multiplier: 2,
  });

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout();
      window.location.hash = '#/admin';  // 触发 hashchange 跳转到 LoginPage
      window.location.reload();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  // 加载 localStorage 中的盲注配置
  useEffect(() => {
    const saved = localStorage.getItem('admin_blind_config');
    if (saved) {
      try { setLocalConfig(JSON.parse(saved)); } catch {}
    }
  }, []);

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
    alert(`已生成 ${newLevels.length} 个盲注级别`);
  };

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
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 border border-red-700/50 hover:bg-red-900/50 rounded text-sm">
            <LogOut size={16} /> 退出登录
          </button>
          <button onClick={toggleFullscreen} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/20 rounded text-sm">
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />} {isFullscreen ? '退出全屏' : '全屏'}
          </button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* 倒计时 + 状态 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <div className="text-sm text-gray-400 mb-2">LEVEL {currentLevel?.level || 0} / {levels.length} · {currentLevel ? `${currentLevel.smallBlind}/${currentLevel.bigBlind}` : '--'}</div>
          <div className="text-7xl font-bold font-mono tracking-wide">{formatTime(elapsedTime)}</div>
          <div className="text-sm text-gray-400 mt-2">状态：{isRunning ? '⏱️ 计时中' : '⏸️ 已暂停'}</div>
        </div>

        {/* 主控制按钮 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {!isRunning ? (
            <button onClick={start} className="py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg text-lg">▶ 开始</button>
          ) : (
            <button onClick={pause} className="py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg text-lg">⏸ 暂停</button>
          )}
          <button onClick={prev} className="py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg">← 上一级</button>
          <button onClick={skip} className="py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg">下一级 →</button>
          <button onClick={reset} className="py-3 bg-red-900/50 hover:bg-red-900/70 border border-red-700 rounded-lg">⟲ 重置</button>
          <button onClick={() => setShowConfig(s => !s)} className="py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg">⚙ 盲注结构</button>
        </div>

        {/* 可编辑的赛事信息（实时同步到投屏页） */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-semibold mb-2" style={{ color: '#c5a572' }}>赛事信息（实时同步投屏页）</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400">大标题（中央顶部）</label>
              <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center" value={settings.eventTitle || ''} onChange={e => updateSettings({ eventTitle: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-400">赛事名称</label>
              <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center" value={settings.tournamentName} onChange={e => updateSettings({ tournamentName: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-400">店铺名称</label>
              <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center" value={settings.clubName} onChange={e => updateSettings({ clubName: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-400">屏幕ID</label>
              <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center" value={settings.screenId || ''} onChange={e => updateSettings({ screenId: e.target.value })} />
            </div>
          </div>
        </div>

        {/* 参赛人数 / 总记分牌 */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-semibold mb-2" style={{ color: '#c5a572' }}>比赛数据</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-400">参赛人数</label>
              <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center text-2xl font-bold" type="number" value={settings.entrantCount} onChange={e => updateSettings({ entrantCount: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-gray-400">满员</label>
              <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center text-2xl font-bold" type="number" value={settings.maxEntrants} onChange={e => updateSettings({ maxEntrants: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-gray-400">总记分牌</label>
              <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center text-2xl font-bold" type="number" value={settings.totalChips} onChange={e => updateSettings({ totalChips: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs text-gray-400">平均记分牌</label>
              <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center text-2xl font-bold" type="number" value={settings.avgChips} onChange={e => updateSettings({ avgChips: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400">警告秒数（最后几秒变红）</label>
            <input className="w-full mt-1 px-3 py-2 bg-black/40 border border-white/20 rounded text-center" type="number" value={settings.warningSeconds} onChange={e => updateSettings({ warningSeconds: Number(e.target.value) })} />
          </div>
          <button
            onClick={() => updateSettings({ isRegistrationClosed: !settings.isRegistrationClosed })}
            className={`w-full py-3 rounded-lg font-bold ${settings.isRegistrationClosed ? 'bg-red-700 hover:bg-red-600' : 'bg-green-700 hover:bg-green-600'}`}
          >
            {settings.isRegistrationClosed ? '已停止报名（点击接受报名）' : '接受报名中（点击停止报名）'}
          </button>
        </div>

        {/* 盲注结构配置（折叠） */}
        {showConfig && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <h2 className="text-base font-semibold mb-2" style={{ color: '#c5a572' }}>盲注结构（重新生成）</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            <button onClick={onApplyConfig} className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg">应用</button>
            <div className="text-xs text-gray-500 mt-2">当前共 {levels.length} 个级别，{currentLevel ? `当前 ${currentLevel.smallBlind}/${currentLevel.bigBlind}` : ''} {nextLevel ? `· 下一 ${nextLevel.smallBlind}/${nextLevel.bigBlind}` : ''}</div>
          </div>
        )}

        <div className="text-center text-xs text-gray-500">
          💡 提示：投屏电脑浏览器打开 [http://localhost:5173/](http://localhost:5173/) 投屏，本页面（[#/admin](http://localhost:5173/#/admin)）作为本地控制后台。两者自动实时同步。
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
