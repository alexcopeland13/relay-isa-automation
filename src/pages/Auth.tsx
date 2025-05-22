import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { routeAfterLogin } from '@/lib/routeAfterLogin';

type UserRole = 'team_lead' | 'showing_agent' | 'lo_assistant';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('team_lead'); // Added role state
  
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await routeAfterLogin(supabase, navigate, session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await routeAfterLogin(supabase, navigate, session.user.id);
        } else {
          if (location.pathname !== '/auth' && location.pathname !== '/') {
             navigate('/auth');
          }
        }
      }
    );

    const params = new URLSearchParams(location.search);
    setIsSignUp(params.get('signup') === 'true');

    return () => subscription.unsubscribe();
  }, [navigate, location]); // Added location to dependency array

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp && password !== confirmPassword) {
        toast({
          title: "Passwords do not match",
          description: "Please make sure your passwords match.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Password too short",
          description: "Password must be at least 6 characters long.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (isSignUp) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName
            }
          }
        });

        if (signUpError) throw signUpError;
        
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
              id: signUpData.user.id, 
              email: signUpData.user.email,
              first_name: firstName,
              last_name: lastName,
              role: role 
            });

          if (profileError) {
            console.error("Error updating profile with role:", profileError);
            toast({
              title: "Profile update failed",
              description: `Could not set user role: ${profileError.message}. Please contact support.`,
              variant: "default"
            });
          } else {
             toast({
              title: "Account created successfully!",
              description: "Your role has been set. Redirecting...",
            });
          }
        } else {
            console.error('Sign up successful but no user data returned.');
            toast({
                title: "Sign up issue",
                description: "Account created, but user data not immediately available. Please try logging in.",
                variant: "default"
            });
            setLoading(false);
            return;
        }

      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        toast({
          title: "Logged in successfully",
          description: "Redirecting...",
        });
      }

    } catch (error) {
      toast({
        title: "Authentication error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setIsSignUp(!isSignUp);
    const url = new URL(window.location.href);
    if (!isSignUp) {
      url.searchParams.set('signup', 'true');
    } else {
      url.searchParams.delete('signup');
    }
    window.history.pushState({}, '', url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="container mx-auto p-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <MessageSquare className="h-10 w-10 text-emmaccent" />
            </div>
            <h1 className="text-2xl font-bold">Welcome to Relay</h1>
            <p className="text-muted-foreground">AI-powered inside sales agents</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isSignUp ? 'Create an account' : 'Log in to your account'}</CardTitle>
              <CardDescription>
                {isSignUp 
                  ? 'Enter your information to create an account' 
                  : 'Enter your credentials to access your account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName"
                          type="text" 
                          placeholder="John" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName"
                          type="text" 
                          placeholder="Doe" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="role">I am a...</Label>
                      <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                        <SelectTrigger id="role" className="w-full">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="team_lead">Team Lead (Realtor)</SelectItem>
                          <SelectItem value="showing_agent">Showing Agent</SelectItem>
                          <SelectItem value="lo_assistant">Loan-Officer Assistant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword"
                      type="password" 
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Login'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <button 
                    type="button"
                    onClick={toggleView} 
                    className="ml-1 text-emmaccent hover:underline"
                  >
                    {isSignUp ? 'Log in' : 'Sign up'}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Auth;
