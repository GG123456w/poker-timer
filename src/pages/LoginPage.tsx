import React, { useState, useEffect } from 'react';
import { LogIn, Lock, User, Eye, EyeOff } from 'lucide-react';
import { login, isLoggedIn, DEFAULT_CREDENTIALS } from '../utils/auth';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 已登录则自动跳转
  useEffect(() => {
    if (isLoggedIn()) {
      window.location.hash = '#/admin';
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 模拟网络延迟
    setTimeout(() => {
      const ok = login(username, password);
      if (ok) {
        window.location.hash = '#/admin';
        window.location.reload();
      } else {
        setError('账号或密码错误');
        setLoading(false);
      }
    }, 300);
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
        </div>

        {/* 登录卡片 */}
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">管理员登录</h2>

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
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
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
                  <span>登录中...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>登 录</span>
                </>
              )}
            </button>
          </form>

          {/* 提示信息 */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-center text-gray-500 text-xs">
              默认账号：<span className="text-amber-500 font-mono">{DEFAULT_CREDENTIALS.username}</span>
              <span className="mx-2">·</span>
              默认密码：<span className="text-amber-500 font-mono">{DEFAULT_CREDENTIALS.password}</span>
            </p>
            <p className="text-center text-gray-600 text-xs mt-2">
              登录后 7 天内自动免登录
            </p>
          </div>
        </div>

        {/* 底部版权 */}
        <p className="text-center text-gray-600 text-xs mt-6">
          © 2026 扑克盲注计时器 · Powered by Vercel
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
