import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { KeyRound, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const passwordValidationSchema = Yup.object().shape({
  password: Yup.string()    
    .required('Password is required')
    .min(12, 'Password must be at least 12 characters')
    .matches(/[a-z]/, 'Must include at least one lowercase letter')
    .matches(/[A-Z]/, 'Must include at least one uppercase letter')
    .matches(/[0-9]/, 'Must include at least one number')
    .matches(/[!@#$%^&*]/, 'Must include at least one special character'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Password reset token is missing.');
    }
  }, [token]);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      setError('');
      setMessage('');
      setLoading(true);

      try {
        const res = await fetch('http://localhost:5000/api/authentication/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, newPassword: values.password }),
        });

        const data = await res.json();

        if (res.ok) {
          setMessage(data.message || 'Your password has been reset. You can now log in.');
          formik.resetForm();
          navigate('/');
        } else {
          setError(data.message || 'Failed to reset password. Please try again.');
        }
      } catch (err) {
        console.error('Reset error:', err);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen w-full items-center justify-center animated-gradient-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex w-full justify-center">
          <img
            src="/images/revynox_logo_black.png"
            alt="Revynox Logo"
            width={200}
            height={50}
            className="dark:invert"
          />
        </div>
        <Card className="w-full shadow-xl bg-card/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <KeyRound className="mx-auto h-8 w-8 text-primary" />
            <CardTitle className="text-2xl text-card-foreground">Reset Your Password</CardTitle>
            <CardDescription className="text-card-foreground/80">
              Enter your new password below.
            </CardDescription>
          </CardHeader>

          <form onSubmit={formik.handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-background/80"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-sm text-red-600">{formik.errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 bg-background/80"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="text-sm text-red-600">{formik.errors.confirmPassword}</p>
                )}
              </div>

              {message && <p className="text-sm text-green-600">{message}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading || !token}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
              <p className="text-center text-sm text-card-foreground/80">
                <span
                  onClick={() => navigate('/')}
                  className="font-semibold text-primary hover:underline cursor-pointer"
                >
                  Back to Login
                </span>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
