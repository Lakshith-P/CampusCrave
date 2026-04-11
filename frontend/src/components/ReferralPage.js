import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Gift, Copy, Users, Coins } from 'lucide-react';
import { toast } from 'sonner';

export const ReferralPage = () => {
  const [user, setUser] = useState(null);
  const [referralInput, setReferralInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadUser(); }, []);
  const loadUser = async () => { try { setUser((await api.getMe()).data); } catch(e) {} };

  const copyCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      toast.success('Referral code copied!');
    }
  };

  const applyCode = async () => {
    if (!referralInput.trim()) { toast.error('Enter a referral code'); return; }
    setLoading(true);
    try {
      const res = await api.applyReferral(referralInput.trim());
      toast.success(res.data.message);
      loadUser();
      setReferralInput('');
    } catch(e) { toast.error(e.response?.data?.detail || 'Failed to apply code'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Outfit', color: '#09090B' }}>Refer & Earn</h2>

      {/* Your Code */}
      <Card className="neo-brutal rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
            <Gift className="w-6 h-6" style={{ color: '#F97316' }} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Your Referral Code</h3>
            <p className="text-sm text-gray-500">Share with friends to earn 50 credits each!</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 px-4 py-3 rounded-xl font-mono font-bold text-xl text-center tracking-wider" style={{ backgroundColor: '#FEF3C7', border: '2px dashed #F97316' }}>
            {user?.referral_code || '...'}
          </div>
          <Button onClick={copyCode} data-testid="copy-referral-btn" className="rounded-xl px-6" style={{ backgroundColor: '#F97316', color: 'white' }}>
            <Copy className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="neo-brutal rounded-2xl p-4 text-center" style={{ backgroundColor: '#FFFFFF' }}>
          <Users className="w-6 h-6 mx-auto mb-2" style={{ color: '#3B82F6' }} />
          <p className="text-2xl font-bold">{user?.referral_count || 0}</p>
          <p className="text-xs text-gray-500">Friends Referred</p>
        </Card>
        <Card className="neo-brutal rounded-2xl p-4 text-center" style={{ backgroundColor: '#FFFFFF' }}>
          <Coins className="w-6 h-6 mx-auto mb-2" style={{ color: '#F97316' }} />
          <p className="text-2xl font-bold">{user?.credits || 0}</p>
          <p className="text-xs text-gray-500">Credits Balance</p>
        </Card>
        <Card className="neo-brutal rounded-2xl p-4 text-center" style={{ backgroundColor: '#FFFFFF' }}>
          <Gift className="w-6 h-6 mx-auto mb-2" style={{ color: '#10B981' }} />
          <p className="text-2xl font-bold">{user?.loyalty_points || 0}</p>
          <p className="text-xs text-gray-500">Loyalty Points</p>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="neo-brutal rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
        <h3 className="font-bold text-lg mb-4">How It Works</h3>
        <div className="space-y-4">
          {[
            { step: '1', text: 'Share your unique referral code with friends', color: '#3B82F6' },
            { step: '2', text: 'They sign up and enter your code', color: '#F97316' },
            { step: '3', text: 'You get 50 credits, they get 25 credits!', color: '#10B981' },
          ].map(s => (
            <div key={s.step} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0" style={{ backgroundColor: s.color }}>{s.step}</div>
              <p className="text-sm font-medium">{s.text}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Apply Code */}
      <Card className="neo-brutal rounded-2xl p-6" style={{ backgroundColor: '#FEF3C7' }}>
        <h3 className="font-bold text-lg mb-3">Have a referral code?</h3>
        <div className="flex gap-3">
          <Input data-testid="referral-code-input" value={referralInput} onChange={e => setReferralInput(e.target.value)} placeholder="Enter code" className="border-2 border-black rounded-lg" />
          <Button data-testid="apply-referral-btn" onClick={applyCode} disabled={loading} className="rounded-lg px-6" style={{ backgroundColor: '#09090B', color: 'white' }}>
            {loading ? '...' : 'Apply'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
