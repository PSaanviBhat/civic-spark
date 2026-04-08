import { FormEvent, useState } from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

import { useLogin, useRegister } from '@/hooks/api/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function AuthView() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = useLogin();
  const register = useRegister();

  const isLoading = login.isPending || register.isPending;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        await login.mutateAsync({ phone_or_email: phoneOrEmail, password });
      } else {
        await register.mutateAsync({ name, phone_or_email: phoneOrEmail, password });
      }
      window.location.reload();
    } catch (submissionError: any) {
      setError(submissionError.message ?? 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="rounded-3xl gradient-hero p-6 text-primary-foreground shadow-elevated">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Civic Spark</h1>
              <p className="text-sm text-primary-foreground/80">Real reports, real verification, real civic action.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-white/15 text-white border-white/20">AWS S3 Uploads</Badge>
            <Badge className="bg-white/15 text-white border-white/20">AI Verification</Badge>
          </div>
        </div>

        <Card className="shadow-card">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle>{mode === 'login' ? 'Sign In' : 'Create Account'}</CardTitle>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
              <Button variant={mode === 'login' ? 'default' : 'ghost'} onClick={() => setMode('login')}>
                Login
              </Button>
              <Button variant={mode === 'register' ? 'default' : 'ghost'} onClick={() => setMode('register')}>
                Register
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="identifier">Phone or email</Label>
                <Input
                  id="identifier"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  placeholder="name@example.com or phone"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isLoading}>
                {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
