import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, LogIn, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { parseApiError } from '@/lib/parseApiError';

const loginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'), // .min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { remember: false },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      await login(values);
      toast.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Username */}
      <div className="space-y-1.5">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Tên đăng nhập
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <User size={15} strokeWidth={1.8} />
          </div>
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="Nhập tên đăng nhập"
            autoFocus
            {...register('username')}
            className="block h-11 w-full rounded-lg border border-gray-200 bg-gray-50/80 pl-10 pr-3.5 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 aria-[invalid]:border-red-400 aria-[invalid]:focus:ring-red-400/20"
            aria-invalid={errors.username ? 'true' : undefined}
          />
        </div>
        {errors.username && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Mật khẩu
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
            <Lock size={15} strokeWidth={1.8} />
          </div>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Nhập mật khẩu"
            {...register('password')}
            className="block h-11 w-full rounded-lg border border-gray-200 bg-gray-50/80 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 aria-[invalid]:border-red-400 aria-[invalid]:focus:ring-red-400/20"
            aria-invalid={errors.password ? 'true' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Remember me & Forgot password */}
      <div className="flex items-center justify-between pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer select-none group">
          <input
            type="checkbox"
            {...register('remember')}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600 cursor-pointer"
          />
          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
            Ghi nhớ đăng nhập
          </span>
        </label>
        <button
          type="button"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        >
          Quên mật khẩu?
        </button>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:from-blue-700 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-600/30 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Đang đăng nhập...</span>
          </>
        ) : (
          <>
            <LogIn size={15} strokeWidth={2} />
            <span>Đăng nhập</span>
          </>
        )}
      </button>
    </form>
  );
}
