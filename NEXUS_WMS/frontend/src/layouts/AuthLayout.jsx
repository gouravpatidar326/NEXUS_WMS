import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full bg-background text-on-background">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
