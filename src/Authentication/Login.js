
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import axios from 'axios';
export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
    const formik = useFormik({
      initialValues: {
        email: '',
        password: '',
      },
      validationSchema: Yup.object({
        email: Yup.string()
          .email('Invalid email address')
          .required('Email is required'),
        password: Yup.string()
 
          .required('Password is required')
         
          }),
      onSubmit: async (values, { setSubmitting, setStatus }) => {
        setStatus(null);
        try {
    const response = await axios.post('http://localhost:5000/api/authentication/login', {
      email: values.email,
      password: values.password,
    });
 const data = response.data;
 toast({
      title: 'Login successful!',
      description: 'Redirecting to dashboard...',
      duration: 180000, // 3 minutes
    });
    navigate('/dashboard');
    // Optional: store token
    // localStorage.setItem('accessToken', data.accessToken);

    // Optional: redirect user
    // window.location.href = '/dashboard';

  } catch (error) {
    console.error('Login error:', error);

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setStatus(message);
       toast({
        title: 'Login Failed',
        description: message,
        variant: 'destructive',
        duration: 180000,
      });
    } else {
      setStatus('Unexpected error. Please try again later.');
      toast({
        title: 'Unexpected Error',
        description: 'Please try again later.',
        variant: 'destructive',
        duration: 180000,
      });  
      }
  } finally {
    setSubmitting(false);
  }
}
    });
  
    return (
      <div className="flex min-h-screen w-full items-center justify-center animated-gradient-background p-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex w-full justify-center">
            <img
              src="./images/revynox_logo_black.png"
              alt="Revynox Logo"
              width={200}
              height={50}
              className="dark:invert"
            />
          </div>
          <Card className="w-full shadow-xl bg-card/90 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl text-card-foreground">Welcome Back!</CardTitle>
            <CardDescription className="text-card-foreground/80">Enter your credentials to access your account</CardDescription>
          </CardHeader>
            <form onSubmit={formik.handleSubmit}>
              <CardContent className="space-y-4">
               
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-card-foreground/90">Email</Label>
                  <div className="relative" suppressHydrationWarning={true}>
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="pl-10 bg-background/80 text-foreground placeholder:text-muted-foreground/70"
                    />
                  </div>
                  {formik.touched.email && formik.errors.email ? (
                    <p className="text-destructive text-sm">{formik.errors.email}</p>
                  ) : null}
                </div>
  
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-card-foreground/90">Password</Label>
                  <div className="relative" suppressHydrationWarning={true}>
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="pl-10 placeholder:text-muted-foreground/70 bg-background/80 text-foreground"
                    />
                  </div>
                  {formik.touched.password && formik.errors.password ? (
                    <p className="text-destructive text-sm">{formik.errors.password}</p>
                  ) : null}
                </div>
  

                 <div className="flex items-center justify-end">
                <a href="/forget" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              </CardContent>
  
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? 'Logging In...' : 'Login'}
                </Button>
                 <p className="text-center text-sm text-card-foreground/80">
                Don&apos;t have an account?{' '}
                  <a href="/signup" className="font-semibold text-primary hover:underline">
                    Sign Up
                  </a>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    );
  }
  