import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Welcome back!');
      } else {
        await register(email, password, name, 'student');
        toast.success('Account created! You received 100 free credits!');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#FEFCE8' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'Outfit', color: '#09090B' }}>
            CampusCrave
          </h1>
          <p className="text-lg" style={{ color: '#52525B' }}>Skip the queue, order in seconds!</p>
        </div>

        <Card className="neo-brutal rounded-2xl" style={{ backgroundColor: '#FFFFFF', padding: '2rem' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-sm font-semibold" style={{ color: '#09090B' }}>Full Name</Label>
                <Input
                  id="name"
                  data-testid="register-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 border-2 border-black rounded-lg p-3"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-semibold" style={{ color: '#09090B' }}>Email</Label>
              <Input
                id="email"
                data-testid="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 border-2 border-black rounded-lg p-3"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-semibold" style={{ color: '#09090B' }}>Password</Label>
              <Input
                id="password"
                data-testid="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 border-2 border-black rounded-lg p-3"
                required
              />
            </div>

            <Button
              data-testid="login-submit-button"
              type="submit"
              className="w-full rounded-full py-6 text-lg font-bold transition-transform hover:scale-105"
              style={{ backgroundColor: '#F97316', color: '#FFFFFF' }}
            >
              {isLogin ? 'Login' : 'Create Account'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-medium underline"
                style={{ color: '#F97316' }}
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
              </button>
            </div>

            {isLogin && (
              <div className="text-xs mt-4 p-4 rounded-lg" style={{ backgroundColor: '#FEFCE8', border: '1px solid #FBBF24' }}>
                <p className="font-semibold mb-2">Test Credentials:</p>
                <p>Student: student@lpu.in / student123</p>
                <p>Staff: dominos@campuscrave.com / staff123</p>
                <p>Admin: admin@campuscrave.com / admin123</p>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};