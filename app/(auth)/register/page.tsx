'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import { 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Paper,
  Typography,
  Link as MuiLink,
  IconButton,
  InputAdornment,
  Box
} from '@mui/material';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, UserCircle2 } from 'lucide-react';
import { registerAction } from '@/app/auth/actions';

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
      {pending ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
    </Button>
  );
}

function SuccessScreen() {
  const router = useRouter();
  
  // Redirect after 3 seconds
  useState(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 3000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Paper 
        elevation={8}
        className="max-w-md w-full p-8 rounded-2xl border-2 border-green-300 dark:border-green-700 bg-white dark:bg-gray-800 text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-green-600 dark:text-green-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>
        
        <Typography 
          variant="h4" 
          className="font-black text-gray-900 dark:text-white mb-2"
          sx={{ textShadow: '2px 2px 0px rgba(0, 210, 106, 0.2)' }}
        >
          Account Created! 
        </Typography>
        
        <Typography className="text-gray-600 dark:text-gray-400 mb-6">
          Your account has been successfully created. Redirecting to login page...
        </Typography>
        
        <Alert 
          severity="info" 
          className="mb-6 border-2 border-blue-300 dark:border-blue-800 text-left"
        >
        </Alert>
        
        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
          <CircularProgress size={16} />
          <Typography variant="body2">
            Redirecting to login page...
          </Typography>
        </div>
      </Paper>
    </div>
  );
}

export default function RegisterPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [clientError, setClientError] = useState('');
  
  const [state, formAction] = useFormState(registerAction, { error: null, success: false });

  // Show success screen if registration succeeded
  if (state?.success) {
    return <SuccessScreen />;
  }

  // Client-side password validation
  const handleSubmit = (formData: FormData) => {
    const pwd = formData.get('password') as string;
    const confirmPwd = formData.get('confirmPassword') as string;

    if (pwd !== confirmPwd) {
      setClientError('Passwords do not match');
      return;
    }

    if (pwd.length < 6) {
      setClientError('Password must be at least 6 characters');
      return;
    }

    setClientError('');
    // If validation passes, the form will submit to server action
  };

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
            Register Here! 
          </Typography>
          <Typography variant="body1" className="text-gray-600 dark:text-gray-400">
            Start your comic reading adventure
          </Typography>
        </div>

        <form action={formAction} className="space-y-4">
          {(state?.error || clientError) && (
            <Alert 
              severity="error"
              className="border border-red-300 dark:border-red-800"
            >
              {clientError || state?.error}
            </Alert>
          )}

          {/* Username Field */}
          <TextField
            fullWidth
            label="Username"
            name="username"
            required
            autoComplete="username"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <User className="text-gray-500 dark:text-gray-400" size={20} />
                </InputAdornment>
              ),
              className: "bg-gray-50 dark:bg-gray-700"
            }}
            InputLabelProps={{
              className: "dark:text-gray-300"
            }}
          />

          {/* Full Name Field */}
          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            autoComplete="name"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <UserCircle2 className="text-gray-500 dark:text-gray-400" size={20} />
                </InputAdornment>
              ),
              className: "bg-gray-50 dark:bg-gray-700"
            }}
            InputLabelProps={{
              className: "dark:text-gray-300"
            }}
          />

          {/* Email Field */}
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            name="email"
            required
            autoComplete="email"
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
          />

          {/* Password Field */}
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
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
            helperText="Minimum 6 characters"
          />

          {/* Confirm Password Field */}
          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    className="text-gray-500 dark:text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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

          {/* Sign In Link */}
          <div className="text-center pt-2">
            <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <MuiLink 
                component={Link} 
                href="/login" 
                className="font-bold text-[#00d26a] dark:text-[#00ff81] hover:underline"
              >
                Login
              </MuiLink>
            </Typography>
          </div>
        </form>

        
      </Paper>
    </div>
  );
}
