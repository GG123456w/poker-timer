import React, { useState, useEffect } from 'react';
import { LogIn, Lock, User, Eye, EyeOff, Cloud, CloudOff } from 'lucide-react';
import { isLoggedIn, login as localLogin } from '../utils/auth';
import { cloudLogin, cloudRegister, isCloudEnabled } from '../utils/cloudSync';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const cloudOn = isCloudEnabled();

  useEffect(() => {
    if (isLoggedIn()) {
      window.location.hash = '#/admin';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (cloudOn) {
        // 云端鉴权
        if (mode === 'register') {
          await cloudRegister(username, password);
          setError('注册成功，请登录');
          setMode('login');
        } else {
          await cloudLogin(username, password);
        }
      } else {
        // 本地鉴权（30天 session）
        const ok = localLogin(username, password);
        if (!ok) throw new Error('账号或密码错误');
      }
      window.location.hash = '#/admin';
      window.location.reload();
    } catch (e: any) {
      setError(e.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mb-4 shadow-2xl">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(251, 191, 36, 0.3)',
            }}
          >
            扑克盲注计时器
          </h1>
          <p className="text-gray-400 text-sm">后台管理系统</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
            style={{
              background: cloudOn ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
              color: cloudOn ? '#22c55e' : '#9ca3af',
              border: `1px solid ${cloudOn ? 'rgba(34, 197, 94, 0.3)' : 'rgba(156, 163, 175, 0.3)'}`,
            }}
          >
            {cloudOn ? <Cloud size={12} /> : <CloudOff size={12} />}
            <span>{cloudOn ? '云端鉴权已启用' : '本地鉴权模式'}</span>
          </div>
        </div>

        {/* 登录卡片 */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {cloudOn ? (mode === 'login' ? '管理员登录' : '注册新账号') : '管理员登录'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 账号 */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">账号</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入账号"
                  className="w-full pl-11 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* 密码 */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-11 pr-11 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                  autoComplete="current-password"
                  required
                  minLength={cloudOn ? 6 : 1}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className={`rounded-lg px-4 py-3 text-sm text-center ${
                error.includes('成功') ? 'bg-green-500/10 border border-green-500/50 text-green-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'
              }`}>
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-lg shadow-lg shadow-amber-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{mode === 'login' ? '登录中...' : '注册中...'}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>{mode === 'login' ? '登 录' : '注 册'}</span>
                </>
              )}
            </button>

            {cloudOn && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                  className="text-sm text-amber-500 hover:text-amber-400 transition-colors"
                >
                  {mode === 'login' ? '没有账号？立即注册' : '已有账号？返回登录'}
                </button>
              </div>
            )}
          </form>

          {/* 提示信息（不显示默认账号密码） */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-center text-gray-600 text-xs">
              登录后 30 天内自动免登录
            </p>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          © 2026 扑克盲注计时器 · Powered by Vercel
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
