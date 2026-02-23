'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Paper,
  Typography,
  Box,
  Link as MuiLink,
  IconButton,
  InputAdornment
} from '@mui/material';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginAction } from '@/app/auth/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button
      fullWidth
      type="submit"
      variant="contained"
      size="large"
      disabled={pending}
      className="py-3 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
      sx={{
        background: 'linear-gradient(135deg, #00d26a 0%, #00ff81 100%)',
        color: '#1a1a1a',
        '&:hover': {
          background: 'linear-gradient(135deg, #00b858 0%, #00e070 100%)',
          transform: 'translateY(-2px)',
        },
        '&:disabled': {
          background: '#cccccc',
          color: '#666666'
        }
      }}
    >
      {pending ? <CircularProgress size={24} color="inherit" /> : 'Login'}
    </Button>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [showPassword, setShowPassword] = useState(false);
  
  const [state, formAction] = useFormState(loginAction, { error: '' });

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Paper 
        elevation={8}
        className="max-w-md w-full p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Typography 
            variant="h3" 
            component="h1" 
            className="font-black text-gray-900 dark:text-white mb-2"
            sx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem' },
              textShadow: '2px 2px 0px rgba(0, 210, 106, 0.2)'
            }}
          >
            Welcome Back!
          </Typography>
          <Typography variant="body1" className="text-gray-600 dark:text-gray-400">
            Sign in to continue your reading journey
          </Typography>
        </div>

        <form action={formAction} className="space-y-5">
          {state?.error && (
            <Alert 
              severity="error" 
              className="border border-red-300 dark:border-red-800"
            >
              {state.error}
            </Alert>
          )}

          <input type="hidden" name="redirect" value={redirect} />

          {/* Email Field */}
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            name="email"
            required
            autoComplete="email"
            autoFocus
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail className="text-gray-500 dark:text-gray-400" size={20} />
                </InputAdornment>
              ),
              className: "bg-gray-50 dark:bg-gray-700"
            }}
            InputLabelProps={{
              className: "dark:text-gray-300"
            }}
            className="dark:text-white"
          />

          {/* Password Field */}
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            required
            autoComplete="current-password"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock className="text-gray-500 dark:text-gray-400" size={20} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    className="text-gray-500 dark:text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </IconButton>
                </InputAdornment>
              ),
              className: "bg-gray-50 dark:bg-gray-700"
            }}
            InputLabelProps={{
              className: "dark:text-gray-300"
            }}
          />

          <SubmitButton />

          {/* Sign Up Link */}
          <div className="text-center pt-2">
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              Don't have an account yet?{' '}
              <MuiLink 
                component={Link} 
                href="/register" 
                className="font-bold text-[#00d26a] dark:text-[#00ff81] hover:underline"
              >
                Register here
              </MuiLink>
            </Typography>
          </div>
        </form>

        
      </Paper>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
