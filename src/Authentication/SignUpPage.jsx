import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { useFormik } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';
import { BASE_URL } from '../lib/Api';


export default function SignUpPage() {
  const { toast } = useToast();
  const formik = useFormik({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      fullName: Yup.string()
        .required('Full Name is required')
        .min(3, 'Full Name must be at least 3 characters'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(12, 'Password must be at least 12 characters')
    .matches(/[a-z]/, 'Must include at least one lowercase letter')
    .matches(/[A-Z]/, 'Must include at least one uppercase letter')
    .matches(/[0-9]/, 'Must include at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must include at least one special character')
          .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      setStatus(null);
       try {
    const response = await axios.post(`${BASE_URL}/authentication/signup`, {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
    });
  //  console.log(response.data);
    toast({
      title: 'User Successfully Created',
      description: 'Account created successfully! Please check your email for a verification link.',
     
    })
    formik.resetForm();
  } catch (error) {
     const errorMessage =
      error.response?.data?.message || error.message || 'Signup failed. Please try again.';

    if (errorMessage.includes('User already registered') || errorMessage.includes('User already exists')) {
     toast({
      title: 'User already registered',
      description: 'An account with this email already exists.',
      variant: 'destructive',
      
     })
    } else {
       toast({
        title: 'Unexpected Error',
        description: `${errorMessage}`,
        variant: 'destructive',
        
      });  
    }

    setStatus(errorMessage);
 
  } finally {
    setSubmitting(false);
  }
},
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
            <CardTitle className="text-2xl text-card-foreground">Create an Account</CardTitle>
            <CardDescription className="text-card-foreground/80">Enter your details to get started</CardDescription>
          </CardHeader>

          <form onSubmit={formik.handleSubmit}>
            <CardContent className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-card-foreground/90">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="pl-10 bg-background/80 text-foreground placeholder:text-muted-foreground/70"
                  />
                </div>
                {formik.touched.fullName && formik.errors.fullName ? (
                  <p className="text-destructive text-sm">{formik.errors.fullName}</p>
                ) : null}
              </div>

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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-card-foreground/90">Confirm Password</Label>
                <div className="relative" suppressHydrationWarning={true}>
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="pl-10 placeholder:text-muted-foreground/70 bg-background/80 text-foreground"
                  />
                </div>
                {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                  <p className="text-destructive text-sm">{formik.errors.confirmPassword}</p>
                ) : null}
              </div>
                
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
              <p className="text-center text-sm text-card-foreground/80">
                Already have an account?{' '}
                <a href="/" className="font-semibold text-primary hover:underline">
                  Login
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
