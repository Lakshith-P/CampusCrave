import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Zap, ShoppingBag, Clock, Mic, Star, Gift } from 'lucide-react';

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1773620496832-9b62e8912452?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHw0fHxkZWxpY2lvdXMlMjBwaXp6YSUyMHNsaWNlJTIwcGhvdG9ncmFwaHl8ZW58MHx8fHwxNzc1OTE5MzIzfDA&ixlib=rb-4.1.0&q=85',
  'https://images.unsplash.com/photo-1559561724-732dbca7be1e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB0aGFsaSUyMGZvb2QlMjBwaG90b2dyYXBoeXxlbnwwfHx8fDE3NzU5MTkzMjN8MA&ixlib=rb-4.1.0&q=85',
  'https://images.unsplash.com/photo-1763689389824-dd2cea2e5772?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwzfHxidXJnZXIlMjBhbmQlMjBmcmllcyUyMGNvbWJvfGVufDB8fHx8MTc3NTkxOTMyOXww&ixlib=rb-4.1.0&q=85',
  'https://images.unsplash.com/photo-1702564696095-ba5110856bf2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwyfHxpY2UlMjBjcmVhbSUyMHN1bmRhZSUyMGRlc3NlcnR8ZW58MHx8fHwxNzc1OTIwNDgxfDA&ixlib=rb-4.1.0&q=85',
];

const FEATURES = [
  { icon: Zap, text: 'Order in under 20 seconds', color: '#F97316' },
  { icon: Clock, text: 'Delivery in 20 minutes', color: '#3B82F6' },
  { icon: Mic, text: 'Voice order support', color: '#10B981' },
  { icon: Gift, text: '100 free credits on signup', color: '#8B5CF6' },
];

export const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % FOOD_IMAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen flex" style={{ backgroundColor: '#FEFCE8' }}>
      {/* Left - Hero Section (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ backgroundColor: '#09090B' }}>
        {/* Rotating food images */}
        {FOOD_IMAGES.map((img, idx) => (
          <motion.div
            key={idx}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: currentImage === idx ? 0.5 : 0 }}
            transition={{ duration: 1 }}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </motion.div>
        ))}

        {/* Overlay content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl xl:text-6xl font-bold leading-tight"
              style={{ fontFamily: 'Outfit', color: '#FFFFFF' }}
            >
              Skip the<br />Queue,<br />
              <span style={{ color: '#F97316' }}>Order in Seconds.</span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-lg leading-relaxed max-w-md"
              style={{ color: '#94A3B8' }}
            >
              Your favourite campus food courts and stores, delivered right to your hostel door.
            </motion.p>
          </div>

          {/* Feature pills */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-3"
          >
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <Icon className="w-4 h-4" style={{ color: feat.color }} />
                  <span className="text-sm font-medium text-white">{feat.text}</span>
                </div>
              );
            })}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-8 mt-8"
          >
            <div>
              <p className="text-3xl font-bold text-white">8+</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Food Courts</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">3</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Stores</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">20min</p>
              <p className="text-xs" style={{ color: '#94A3B8' }}>Avg Delivery</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">4.5</p>
              <p className="text-xs flex items-center gap-1" style={{ color: '#94A3B8' }}><Star className="w-3 h-3 fill-current text-yellow-400" /> Rating</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Mobile header */}
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: 'Outfit', color: '#09090B' }}>
              Campus<span style={{ color: '#F97316' }}>Crave</span>
            </h1>
            <p className="text-base mt-2" style={{ color: '#52525B' }}>
              {isLogin ? 'Welcome back! Login to order.' : 'Create your account & get 100 free credits!'}
            </p>
          </div>

          {/* Mobile features */}
          <div className="flex gap-2 mb-6 overflow-x-auto lg:hidden pb-1">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0 text-xs font-medium" style={{ backgroundColor: '#FFFFFF', border: '2px solid #000', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}>
                  <Icon className="w-3 h-3" style={{ color: feat.color }} />
                  {feat.text}
                </div>
              );
            })}
          </div>

          <Card className="neo-brutal rounded-2xl" style={{ backgroundColor: '#FFFFFF', padding: '1.5rem' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-sm font-semibold" style={{ color: '#09090B' }}>Full Name</Label>
                  <Input id="name" data-testid="register-name-input" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 border-2 border-black rounded-lg h-11" placeholder="Enter your name" required={!isLogin} />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-semibold" style={{ color: '#09090B' }}>Email</Label>
                <Input id="email" data-testid="login-email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 border-2 border-black rounded-lg h-11" placeholder="you@lpu.in" required />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-semibold" style={{ color: '#09090B' }}>Password</Label>
                <Input id="password" data-testid="login-password-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 border-2 border-black rounded-lg h-11" placeholder="Enter password" required />
              </div>

              <Button data-testid="login-submit-button" type="submit" className="w-full rounded-full py-6 text-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ backgroundColor: '#F97316', color: '#FFFFFF', border: '2px solid #000', boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)' }}>
                {isLogin ? 'Login' : 'Create Account'}
              </Button>

              <div className="text-center">
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm font-semibold" style={{ color: '#F97316' }}>
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                </button>
              </div>

              {isLogin && (
                <div className="text-xs p-3 rounded-xl space-y-1" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FBBF24' }}>
                  <p className="font-bold mb-1.5">Quick Login:</p>
                  <button type="button" onClick={() => { setEmail('student@lpu.in'); setPassword('student123'); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors font-medium">
                    Student: student@lpu.in
                  </button>
                  <button type="button" onClick={() => { setEmail('dominos@campuscrave.com'); setPassword('staff123'); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors font-medium">
                    Staff: dominos@campuscrave.com
                  </button>
                  <button type="button" onClick={() => { setEmail('admin@campuscrave.com'); setPassword('admin123'); }} className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-yellow-100 transition-colors font-medium">
                    Admin: admin@campuscrave.com
                  </button>
                </div>
              )}
            </form>
          </Card>

          {!isLogin && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-4 p-4 rounded-xl neo-brutal" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                  <Gift className="w-5 h-5" style={{ color: '#F97316' }} />
                </div>
                <div>
                  <p className="font-bold text-sm">100 Free Credits!</p>
                  <p className="text-xs" style={{ color: '#52525B' }}>Get credits on signup + earn more by referring friends</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
