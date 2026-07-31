import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Reset Password
        </h2>
        <p className="text-xs text-surface-400">
          Enter your registered email address to receive password recovery steps
        </p>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1">
              Registered Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={Mail}
              placeholder="user@stitchnexus.com"
              required
            />
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Send Reset Instructions
          </Button>
        </form>
      ) : (
        <div className="p-4 bg-success-950/40 border border-success-800 rounded-xl text-center space-y-3">
          <CheckCircle2 className="h-10 w-10 text-success-500 mx-auto" />
          <h3 className="text-sm font-semibold text-white">Instructions Sent</h3>
          <p className="text-xs text-surface-300">
            If an account exists for <strong className="text-white">{email}</strong>, you will receive password reset instructions shortly.
          </p>
        </div>
      )}

      <button
        onClick={() => navigate('/auth/login')}
        className="w-full flex items-center justify-center gap-2 text-xs text-surface-400 hover:text-white transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Sign In
      </button>
    </div>
  );
};

export default ForgotPasswordPage;
