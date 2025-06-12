  import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { BASE_URL } from '../lib/Api';
export default function Forgetpassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // ACTUAL API CALL to your backend
      const res = await fetch(`${BASE_URL}/authentication/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        // Always display a generic success message for security reasons
        setMessage(
          data.message ||
            "If an account exists for this email, a password reset link has been sent. Please check your inbox (and spam folder)."
        );
        // Optionally, clear the email field after successful submission
        setEmail(''); 
      } else {
        // For actual errors (e.g., server down, validation error)
        setError(data.message || "An unexpected error occurred. Please try again.");
      }
    } catch (err) {
      console.error("Forgot password error:", err); // Log the full error object
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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
            <CardTitle className="text-2xl text-card-foreground">Forgot Your Password?</CardTitle>
            <CardDescription className="text-card-foreground/80">
              No problem! Enter your email address and we&apos;ll send you a link to reset it.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-card-foreground/90">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="pl-10 bg-background/80 text-foreground placeholder:text-muted-foreground/70"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              {message && <p className="text-sm text-green-600 dark:text-green-400">{message}</p>}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send Password Reset Email'}
              </Button>
              <p className="text-center text-sm text-card-foreground/80">
                Remember your password?{' '}
                <span
                  onClick={() => navigate('/')}
                  className="font-semibold text-primary hover:underline cursor-pointer"
                >
                  Login
                </span>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}