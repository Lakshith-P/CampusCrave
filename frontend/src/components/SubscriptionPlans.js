import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const PLANS = [
  {
    id: 'weekly',
    name: 'Weekly',
    duration: '7 days',
    icon: Zap,
    color: '#3B82F6',
    tiers: [
      { meals: 1, label: '1 Meal/Day', price: 499, savings: 30 },
      { meals: 2, label: '2 Meals/Day', price: 899, savings: 35 },
      { meals: 3, label: '3 Meals/Day', price: 1199, savings: 40 },
    ]
  },
  {
    id: 'monthly',
    name: 'Monthly',
    duration: '30 days',
    popular: true,
    icon: Crown,
    color: '#F97316',
    tiers: [
      { meals: 1, label: '1 Meal/Day', price: 1799, savings: 35 },
      { meals: 2, label: '2 Meals/Day', price: 3299, savings: 40 },
      { meals: 3, label: '3 Meals/Day', price: 4499, savings: 45 },
    ]
  },
  {
    id: 'semester',
    name: 'Semester',
    duration: '6 months',
    icon: Sparkles,
    color: '#8B5CF6',
    tiers: [
      { meals: 1, label: '1 Meal/Day', price: 8999, savings: 45 },
      { meals: 2, label: '2 Meals/Day', price: 16999, savings: 50 },
      { meals: 3, label: '3 Meals/Day', price: 23999, savings: 55 },
    ]
  }
];

const BENEFITS = ['Free delivery on all orders', 'Priority order processing', '2x loyalty points', 'Exclusive menu items', 'No surge pricing'];

export const SubscriptionPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedTier, setSelectedTier] = useState(1);

  const activePlan = PLANS.find(p => p.id === selectedPlan);

  const handleSubscribe = () => {
    const tier = activePlan.tiers[selectedTier];
    toast.success(`Subscribed to ${activePlan.name} - ${tier.label} plan!`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Outfit', color: '#09090B' }}>Meal Plans</h2>
        <p className="text-sm mt-1" style={{ color: '#52525B' }}>Save up to 55% with subscription plans</p>
      </div>

      {/* Plan Duration Selector */}
      <div className="flex gap-3">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          const active = selectedPlan === plan.id;
          return (
            <button key={plan.id} onClick={() => { setSelectedPlan(plan.id); setSelectedTier(1); }}
              className={`flex-1 p-4 rounded-2xl border-2 transition-all relative ${active ? '' : ''}`}
              style={{ backgroundColor: active ? `${plan.color}10` : '#FFF', borderColor: active ? '#000' : '#E5E7EB', boxShadow: active ? '4px 4px 0px rgba(0,0,0,1)' : 'none' }}>
              {plan.popular && <Badge className="absolute -top-2 right-3 text-xs" style={{ backgroundColor: '#F97316', color: '#FFF' }}>POPULAR</Badge>}
              <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: plan.color }} />
              <p className="font-bold text-sm">{plan.name}</p>
              <p className="text-xs text-gray-500">{plan.duration}</p>
            </button>
          );
        })}
      </div>

      {/* Tier Cards */}
      {activePlan && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {activePlan.tiers.map((tier, idx) => (
            <Card key={idx} onClick={() => setSelectedTier(idx)}
              className={`rounded-2xl p-5 cursor-pointer transition-all ${selectedTier === idx ? 'neo-brutal' : 'border-2 border-gray-200'}`}
              style={{ backgroundColor: selectedTier === idx ? '#FEF3C7' : '#FFF' }}
              data-testid={`plan-tier-${idx}`}>
              <div className="text-center">
                <p className="text-3xl font-bold mb-1">{tier.meals}</p>
                <p className="text-sm font-semibold mb-3">{tier.label}</p>
                <p className="text-2xl font-bold" style={{ color: activePlan.color }}>{'\u20B9'}{tier.price}</p>
                <p className="text-xs text-gray-500">/{activePlan.duration}</p>
                <Badge className="mt-2" style={{ backgroundColor: '#10B981', color: '#FFF' }}>Save {tier.savings}%</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Benefits */}
      <Card className="neo-brutal rounded-2xl p-5" style={{ backgroundColor: '#FFF' }}>
        <h3 className="font-bold mb-3">All Plans Include</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BENEFITS.map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="w-4 h-4" style={{ color: '#10B981' }} />
              <span className="text-sm">{b}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Subscribe Button */}
      {activePlan && (
        <Button data-testid="subscribe-btn" onClick={handleSubscribe} className="w-full rounded-full py-6 text-lg font-bold"
          style={{ backgroundColor: activePlan.color, color: '#FFF', border: '2px solid #000', boxShadow: '4px 4px 0px rgba(0,0,0,1)' }}>
          Subscribe - {'\u20B9'}{activePlan.tiers[selectedTier].price}/{activePlan.duration}
        </Button>
      )}
    </div>
  );
};
