import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FoodBrowsing } from '../components/FoodBrowsing';
import { Cart } from '../components/Cart';
import { OrderTracking } from '../components/OrderTracking';
import { ExternalPickup } from '../components/ExternalPickup';
import { ReferralPage } from '../components/ReferralPage';
import { ProfilePage } from '../components/ProfilePage';
import { SubscriptionPlans } from '../components/SubscriptionPlans';
import { VoiceCommand } from '../components/VoiceCommand';
import { Button } from '../components/ui/button';
import { ShoppingCart, Package, Truck, Search, Gift, User, Crown } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [cartCount, setCartCount] = useState(0);

  const handleCartUpdate = () => setCartCount(prev => prev + 1);

  const handleVoiceCommand = (command) => {
    if (command.type === 'navigate') {
      if (command.target === 'cart') setActiveTab('cart');
      if (command.target === 'orders') setActiveTab('orders');
      if (command.target === 'referral') setActiveTab('referral');
    }
    if (command.type === 'cart_updated') setCartCount(prev => prev + 1);
  };

  const tabs = [
    { id: 'browse', label: 'Browse', icon: Search },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'pickup', label: 'Pickup', icon: Truck },
    { id: 'plans', label: 'Meal Plans', icon: Crown },
    { id: 'referral', label: 'Refer', icon: Gift },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen student-app" style={{ background: 'linear-gradient(180deg, #FFF7ED 0%, #FFFBF0 50%, #FEF3C7 100%)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40" style={{ background: 'linear-gradient(135deg, #F97316 0%, #FB923C 50%, #FDBA74 100%)', borderBottom: '2px solid #000' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'Outfit' }}>
              CampusCrave
            </h1>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', border: '1.5px solid rgba(255,255,255,0.4)' }}>
                <User className="w-4 h-4 text-white" />
                <div>
                  <p className="font-semibold text-sm leading-tight text-white">{user?.name}</p>
                  <p className="text-xs font-bold text-yellow-100">{user?.credits || 100} credits</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setActiveTab('profile')} data-testid="profile-button" className="rounded-full w-10 h-10 text-white hover:bg-white/20">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button key={tab.id} data-testid={`${tab.id}-tab`} onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 font-semibold transition-all flex items-center gap-1.5 shrink-0 text-sm`}
                  style={{
                    backgroundColor: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
                    color: isActive ? '#F97316' : '#FFFFFF',
                    border: isActive ? '2px solid #000' : '1.5px solid rgba(255,255,255,0.3)',
                    boxShadow: isActive ? '3px 3px 0px rgba(0,0,0,1)' : 'none'
                  }}>
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.id === 'cart' && cartCount > 0 && (
                    <Badge className="ml-0.5 text-xs px-1.5" style={{ backgroundColor: isActive ? '#F97316' : '#FFF', color: isActive ? '#FFF' : '#F97316' }}>{cartCount}</Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'browse' && <FoodBrowsing onAddToCart={handleCartUpdate} onGoToCart={() => setActiveTab('cart')} />}
        {activeTab === 'cart' && <Cart cartCount={cartCount} onCartUpdate={handleCartUpdate} />}
        {activeTab === 'orders' && <OrderTracking />}
        {activeTab === 'pickup' && <ExternalPickup />}
        {activeTab === 'plans' && <SubscriptionPlans />}
        {activeTab === 'referral' && <ReferralPage />}
        {activeTab === 'profile' && <ProfilePage />}
      </main>

      <VoiceCommand onCommand={handleVoiceCommand} />
    </div>
  );
};
