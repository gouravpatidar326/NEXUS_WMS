import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { ROLES } from '@/permissions/roles';

export const LoginPage = () => {
  const [email, setEmail] = useState('alex@stitchnexus.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();

  const handleRoleQuickLogin = async (roleKey) => {
    setIsLoading(true);
    setErrorMessage('');
    let targetEmail = 'alex@stitchnexus.com';
    if (roleKey === ROLES.WAREHOUSE_MANAGER) targetEmail = 'jordan@stitchnexus.com';
    if (roleKey === ROLES.INVENTORY_CLERK) targetEmail = 'casey@stitchnexus.com';
    if (roleKey === ROLES.CLIENT) targetEmail = 'sam@acmecorp.com';

    setEmail(targetEmail);
    try {
      const result = await login(targetEmail, '123456');
      setIsLoading(false);
      if (result?.success) {
        notifySuccess(`Logged in as ${result.user.name}`);
        navigate('/dashboard', { replace: true });
      } else {
        const errMsg = result?.message || 'Login failed';
        setErrorMessage(errMsg);
        notifyError(errMsg);
      }
    } catch (err) {
      setIsLoading(false);
      const errMsg = err.message || 'Login failed';
      setErrorMessage(errMsg);
      notifyError(errMsg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email || !password) {
      const msg = 'Please enter both email and password';
      setErrorMessage(msg);
      notifyError(msg);
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      setIsLoading(false);
      if (result?.success) {
        notifySuccess(`Welcome back, ${result.user.name}!`);
        navigate('/dashboard', { replace: true });
      } else {
        const errMsg = result?.message || 'Invalid email or password';
        setErrorMessage(errMsg);
        notifyError(errMsg);
      }
    } catch (err) {
      setIsLoading(false);
      const errMsg = err.message || 'Invalid email or password';
      setErrorMessage(errMsg);
      notifyError(errMsg);
    }
  };

  return (
    <main className="min-h-screen flex w-full bg-slate-50 text-slate-800 font-sans overflow-x-hidden">
      {/* Left Side: Login Portal Form */}
      <section className="w-full lg:w-[45%] xl:w-[40%] bg-white flex flex-col p-6 sm:p-8 lg:p-12 justify-between min-h-screen border-r border-slate-200 shadow-xl z-10">
        
        {/* Brand Logo Header */}
        <div className="mb-4">
          <img 
            src="/images/brand/orbitrex-peptides-logo-transparent.png" 
            alt="Orbitrex Peptides" 
            className="h-20 w-auto object-contain object-left" 
          />
        </div>

        {/* Login Form Center Container */}
        <div className="flex-grow flex flex-col justify-center max-w-[390px] mx-auto w-full my-auto py-4">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-emerald-800 mb-1 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Access your warehouse management dashboard.
            </p>
          </header>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Inline Error Alert Box */}
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs font-medium animate-fadeIn">
                <span className="material-symbols-outlined text-[18px] shrink-0 text-red-600 mt-0.5">
                  error
                </span>
                <div className="flex-1">
                  <p className="font-bold text-red-800 text-xs">Authentication Failed</p>
                  <p className="mt-0.5 text-red-700">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Email Address Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider" htmlFor="email">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  mail
                </span>
                <input
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600 block uppercase tracking-wider" htmlFor="password">
                  PASSWORD
                </label>
                <a className="text-xs font-bold text-emerald-700 hover:underline transition-all" href="#">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                  lock
                </span>
                <input
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2 py-0.5">
              <input
                className="w-3.5 h-3.5 text-emerald-700 border-slate-300 rounded focus:ring-emerald-600 cursor-pointer"
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="text-xs text-slate-600 font-medium cursor-pointer" htmlFor="remember">
                Remember me for 30 days
              </label>
            </div>

            {/* Main Sign-In Button */}
            <button
              className="w-full bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-sm py-3.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  SIGN IN
                  <span className="material-symbols-outlined text-[18px]">login</span>
                </>
              )}
            </button>
          </form>

          {/* Clean Quick Role Selector (Without Tacky Text Headers) */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleQuickLogin(ROLES.SUPER_ADMIN)}
                className="py-2 px-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-500 rounded-lg text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-emerald-700 text-[16px]">admin_panel_settings</span>
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin(ROLES.WAREHOUSE_MANAGER)}
                className="py-2 px-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-500 rounded-lg text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-emerald-700 text-[16px]">manage_accounts</span>
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin(ROLES.INVENTORY_CLERK)}
                className="py-2 px-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-500 rounded-lg text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-emerald-700 text-[16px]">inventory</span>
                Clerk
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin(ROLES.CLIENT)}
                className="py-2 px-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-500 rounded-lg text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-emerald-700 text-[16px]">person</span>
                Client
              </button>
            </div>
          </div>
        </div>

        {/* Footer Security Badges */}
        <footer className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-2 border-t border-slate-200 pt-3 text-slate-500">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 rounded-full border border-slate-200">
            <span className="material-symbols-outlined text-emerald-700 text-[15px]">verified_user</span>
            <span className="text-[10px] font-bold tracking-wider text-slate-700 uppercase">SOC2 TYPE II COMPLIANT</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            System Build: v2.4.0-nexus
          </div>
        </footer>
      </section>

      {/* Right Side: High-Res Original Warehouse Image Showcase */}
      <section className="hidden lg:block lg:w-[55%] xl:w-[60%] relative overflow-hidden bg-slate-900 min-h-screen">
        {/* Original Clean High-Res Image */}
        <div
          className="absolute inset-0 z-0 h-full w-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2000&auto=format&fit=crop')`,
          }}
        ></div>

        {/* Crisp Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-transparent to-transparent z-10"></div>

        {/* Bottom Right Logistics Feature Box */}
        <div className="absolute bottom-10 right-10 z-20 max-w-sm">
          <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl border border-white/40 shadow-2xl space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-700 text-[26px]">precision_manufacturing</span>
              <h3 className="font-bold text-sm text-slate-900">Logistics Intelligence</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Nexus WMS leverages real-time spatial mapping and predictive routing to optimize every picker's journey, reducing warehouse latency by up to 34%.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
