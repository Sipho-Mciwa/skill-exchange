import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle } from '../services/auth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      await signIn(values.email, values.password);
      navigate('/browse');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setServerError(null);
    try {
      await signInWithGoogle();
      navigate('/browse');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1A2E1A] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#2C5F2D] opacity-10" />
        <div className="absolute bottom-20 -right-12 w-48 h-48 rounded-full bg-[#7CB97E] opacity-20" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-[#2C5F2D] opacity-10" />

        {/* Centred content */}
        <div className="flex flex-col items-center justify-center h-full relative z-10 px-12 w-full">
          <div className="text-4xl font-bold text-white flex items-center gap-2">
            <span>🌿</span>
            <span>SkillXchange</span>
          </div>
          <p className="text-[#7CB97E] italic text-lg text-center mt-4 max-w-xs">
            "Every skill has a neighbour waiting to learn it."
          </p>
          <div className="flex gap-2 mt-12">
            <span className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-full">🕐 Free to join</span>
            <span className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-full">📍 Hyperlocal</span>
            <span className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-full">⭐ Skill-based</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 bg-[#F4FAF4] flex items-center justify-center px-6 py-12">
        <div className="max-w-sm w-full mx-auto space-y-6">
          {/* Top logo */}
          <Link to="/" className="flex items-center gap-1.5 text-[#2C5F2D] font-semibold text-sm">
            🌿 SkillXchange
          </Link>

          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold text-[#1A2E1A]">Welcome back</h1>
            <p className="text-sm text-[#6B8F6B] mt-1">Sign in to continue</p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-[#D6EAD7] rounded-full px-4 py-3 text-sm font-medium text-[#1A2E1A] shadow-sm hover:bg-[#F4FAF4] hover:border-[#7CB97E] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#2C5F2D] focus:ring-offset-2 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.565 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-[#D6EAD7]" />
            <span className="text-xs text-[#6B8F6B]">or continue with email</span>
            <div className="flex-1 border-t border-[#D6EAD7]" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#4A6E4B] uppercase tracking-wide block mb-1">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="bg-white border border-[#D6EAD7] rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C5F2D] focus:border-transparent"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-xs font-medium text-[#4A6E4B] uppercase tracking-wide block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="bg-white border border-[#D6EAD7] rounded-xl px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C5F2D] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B8F6B] hover:text-[#2C5F2D] text-base leading-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            {/* Error banner */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                <span>⚠️</span> {serverError}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2C5F2D] hover:bg-[#1A2E1A] text-white font-semibold py-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2C5F2D] focus:ring-offset-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          {/* Bottom link */}
          <p className="text-sm text-[#6B8F6B] text-center">
            No account?{' '}
            <Link to="/register" className="text-[#2C5F2D] font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
