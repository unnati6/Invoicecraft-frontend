import { useEffect, useState, useRef } from 'react'; // Import useRef
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import { BASE_URL } from '../lib/Api';
export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('Confirming your email...');
  const navigate = useNavigate();

  const token = searchParams.get('token');

  // Use a ref to track if the API call has already been made
  const hasCalledApi = useRef(false); 

  useEffect(() => {
    // Only proceed if a token exists and the API hasn't been called yet
    if (!token || hasCalledApi.current) {
      if (!token) {
        setStatus('error');
        setMessage('Missing confirmation token.');
      }
      return; // Exit if no token or already called
    }

    const confirmEmail = async () => {
 
      hasCalledApi.current = true; 

      try {
        const res = await fetch(`${BASE_URL}/authentication/confirm-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Your email has been successfully verified.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Invalid or expired confirmation token.');
        }
      } catch (err) {
        console.error("Email confirmation fetch error:", err); // Add error logging
        setStatus('error');
        setMessage('Something went wrong. Please try again later.');
      }
    };

    confirmEmail(); // Call the function

  }, [token]); // Dependency array: only re-run if token changes

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="w-full shadow-xl bg-card/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-card-foreground">
              Email Confirmation
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center space-y-4 text-center">
            {status === 'loading' && <p className="text-muted-foreground">Confirming...</p>}
            {status === 'success' && (
              <>
                <CheckCircle className="text-green-500 h-12 w-12" />
                <p className="text-foreground">{message}</p>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="text-red-500 h-12 w-12" />
                <p className="text-destructive">{message}</p>
              </>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')} variant="default">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}