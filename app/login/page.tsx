'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const createSession = async (idToken: string) => {
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create session');
    }

    return data;
  };

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'superadmin':
      case 'organizer':
        router.push('/admin');
        break;
      case 'evaluator':
        router.push('/judge/dashboard');
        break;
      case 'pending':
        toast.error('Your account is pending approval. Contact an organizer.');
        break;
      default:
        router.push('/');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();
      
      const sessionData = await createSession(idToken);
      
      if (sessionData.role === 'pending') {
        toast('Account created! Please wait for an organizer to approve your access.', {
          icon: '?',
          duration: 5000,
        });
      } else {
        toast.success('Welcome back!');
      }
      
      redirectByRole(sessionData.role);
    } catch (error: unknown) {
      console.error('Google login error:', error);
      
      // Handle specific Firebase Auth errors
      const errorCode = (error as { code?: string })?.code;
      let message = 'Failed to sign in with Google';
      
      switch (errorCode) {
        case 'auth/popup-closed-by-user':
          message = 'Sign in was cancelled';
          break;
        case 'auth/popup-blocked':
          message = 'Popup was blocked. Please allow popups for this site.';
          break;
        case 'auth/cancelled-popup-request':
          message = 'Another sign in attempt is in progress';
          break;
        case 'auth/network-request-failed':
          message = 'Network error. Please check your connection.';
          break;
        default:
          if (error instanceof Error) {
            message = error.message;
          }
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#333333] bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">CryptX</span>
            <span className="text-[#333333]">/</span>
            <span className="text-[#888888]">Judging</span>
          </Link>
        </div>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-[#a1a1aa]">
              Access the judging platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In - Primary method */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full h-12"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#333333]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0a0a0a] px-4 text-[#71717a] uppercase tracking-wider">
                  Info
                </span>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-[#a1a1aa]">
                New users will be created with pending status.
              </p>
              <p className="text-sm text-[#71717a]">
                Contact your event organizer for access approval or use an invitation link.
              </p>
            </div>

            <div className="pt-4 border-t border-[#333333]">
              <p className="text-center text-xs text-[#71717a]">
                Have an invitation link?{' '}
                <span className="text-[#a1a1aa]">
                  Click it to join a competition directly.
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#333333] py-6 bg-black">
        <div className="container mx-auto px-4 text-center text-[#71717a] text-sm">
          <Link href="/" className="hover:text-white transition-colors">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
