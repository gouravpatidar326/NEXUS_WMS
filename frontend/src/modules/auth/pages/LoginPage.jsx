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

  const { login } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();

  const handleRoleQuickLogin = async (roleKey) => {
    setIsLoading(true);
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
      }
    } catch (err) {
      setIsLoading(false);
      notifyError(err.message || 'Login failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      notifyError('Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      setIsLoading(false);
      if (result?.success) {
        notifySuccess(`Welcome back, ${result.user.name}!`);
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setIsLoading(false);
      notifyError(err.message || 'Invalid credentials');
    }
  };

  return (
    <main className="min-h-screen flex w-full bg-background text-on-background overflow-x-hidden">
      {/* Left Side: Authentication Form */}
      <section className="w-full lg:w-[45%] xl:w-[40%] bg-surface flex flex-col p-6 sm:p-8 lg:p-12 relative justify-between min-h-screen">
        {/* Logo Header */}
        <div className="mb-6">
          <img src="/images/brand/orbitrex-peptides-logo-transparent.png" alt="Orbitrex Peptides" className="h-24 w-auto max-w-full object-contain object-left" />
        </div>

        {/* Login Container */}
        <div className="flex-grow flex flex-col justify-center max-w-[400px] mx-auto w-full my-auto py-6">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-primary mb-1.5">Welcome Back</h1>
            <p className="text-sm text-on-surface-variant">Access your warehouse management dashboard.</p>
          </header>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider" htmlFor="email">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  mail
                </span>
                <input
                  className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-on-surface-variant block uppercase tracking-wider" htmlFor="password">
                  PASSWORD
                </label>
                <a className="text-xs font-semibold text-primary hover:underline transition-all" href="#">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  className="w-full pl-10 pr-12 py-3 bg-white border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2 py-1">
              <input
                className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary cursor-pointer"
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="text-xs text-on-surface-variant cursor-pointer" htmlFor="remember">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-primary text-on-primary font-semibold text-sm py-3.5 rounded-lg hover:bg-primary-container active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

          {/* Quick Demo Role Presets */}
          <div className="mt-6">
            <div className="relative flex items-center mb-3">
              <div className="flex-grow border-t border-outline-variant"></div>
              <span className="flex-shrink mx-3 text-[11px] font-semibold text-outline tracking-wider">DEMO ROLE PRESETS</span>
              <div className="flex-grow border-t border-outline-variant"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleQuickLogin(ROLES.SUPER_ADMIN)}
                className="py-2 px-3 border border-outline-variant rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-[16px]">admin_panel_settings</span>
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin(ROLES.WAREHOUSE_MANAGER)}
                className="py-2 px-3 border border-outline-variant rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-[16px]">manage_accounts</span>
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin(ROLES.INVENTORY_CLERK)}
                className="py-2 px-3 border border-outline-variant rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-[16px]">inventory</span>
                Clerk
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin(ROLES.CLIENT)}
                className="py-2 px-3 border border-outline-variant rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-[16px]">person</span>
                Client
              </button>
            </div>
          </div>
        </div>

        {/* Footer / Status */}
        <footer className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-outline-variant/40 pt-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant">
            <span className="material-symbols-outlined text-on-secondary-container text-[16px]">verified_user</span>
            <span className="text-[11px] font-semibold text-on-secondary-container">SOC2 TYPE II COMPLIANT</span>
          </div>
          <div className="text-[11px] font-mono text-outline">
            System Build: v2.4.0-nexus
          </div>
        </footer>
      </section>

      {/* Right Side: Immersive Illustration */}
      <section className="hidden lg:block lg:w-[55%] xl:w-[60%] relative overflow-hidden bg-slate-900 min-h-screen">
        <div
          className="absolute inset-0 z-0 h-full w-full bg-cover bg-center opacity-85"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2000&auto=format&fit=crop')`,
          }}
        ></div>
        {/* Atmospheric Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-transparent to-transparent z-10 w-24"></div>

        {/* Floating Feature Tag */}
        <div className="absolute bottom-12 right-12 z-20 max-w-sm">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-primary text-[32px]">precision_manufacturing</span>
              <h3 className="font-semibold text-lg text-on-background">Logistics Intelligence</h3>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Nexus WMS leverages real-time spatial mapping and predictive routing to optimize every picker's journey, reducing warehouse latency by up to 34%.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
