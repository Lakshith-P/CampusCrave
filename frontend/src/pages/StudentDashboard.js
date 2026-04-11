import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FoodBrowsing } from '../components/FoodBrowsing';
import { Cart } from '../components/Cart';
import { OrderTracking } from '../components/OrderTracking';
import { ExternalPickup } from '../components/ExternalPickup';
import { ReferralPage } from '../components/ReferralPage';
import { VoiceCommand } from '../components/VoiceCommand';
import { Button } from '../components/ui/button';
import { ShoppingCart, Package, LogOut, User, Truck, Search, Gift } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [cartCount, setCartCount] = useState(0);

  const handleCartUpdate = () => {
    setCartCount(prev => prev + 1);
  };

  const handleVoiceCommand = (command) => {
    if (command.type === 'navigate') {
      if (command.target === 'cart') setActiveTab('cart');
      if (command.target === 'orders') setActiveTab('orders');
      if (command.target === 'referral') setActiveTab('referral');
    }
    if (command.type === 'cart_updated') {
      setCartCount(prev => prev + 1);
    }
  };

  const tabs = [
    { id: 'browse', label: 'Browse', icon: Search },
    { id: 'cart', label: 'Cart', icon: ShoppingCart },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'pickup', label: 'Pickup', icon: Truck },
    { id: 'referral', label: 'Refer & Earn', icon: Gift },
  ];

  return (
    <div className="min-h-screen student-app" style={{ backgroundColor: '#FEFCE8' }}>
      {/* Header */}
      <header className="sticky top-0 z-40" style={{ backgroundColor: '#FFFFFF', borderBottom: '2px solid #000', boxShadow: '0 4px 0px 0px rgba(0,0,0,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: 'Outfit', color: '#09090B' }}>
              CampusCrave
            </h1>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: '#FEF3C7', border: '2px solid #000' }}>
                <User className="w-4 h-4" />
                <div>
                  <p className="font-semibold text-sm leading-tight">{user?.name}</p>
                  <p className="text-xs font-bold" style={{ color: '#F97316' }}>{user?.credits || 100} credits</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                data-testid="logout-button"
                className="rounded-full border-2 border-black w-10 h-10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  data-testid={`${tab.id}-tab`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-5 py-2.5 font-semibold transition-all flex items-center gap-2 shrink-0 ${
                    isActive ? '' : 'hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#F97316' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#09090B',
                    border: isActive ? '2px solid #000' : '2px solid transparent',
                    boxShadow: isActive ? '3px 3px 0px 0px rgba(0,0,0,1)' : 'none'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'cart' && cartCount > 0 && (
                    <Badge className="ml-1 text-xs" style={{ backgroundColor: isActive ? '#FEF3C7' : '#F97316', color: isActive ? '#000' : '#fff' }}>
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'browse' && <FoodBrowsing onAddToCart={handleCartUpdate} />}
        {activeTab === 'cart' && <Cart cartCount={cartCount} onCartUpdate={handleCartUpdate} />}
        {activeTab === 'orders' && <OrderTracking />}
        {activeTab === 'pickup' && <ExternalPickup />}
        {activeTab === 'referral' && <ReferralPage />}
      </main>

      {/* Voice Command Button */}
      <VoiceCommand onCommand={handleVoiceCommand} />
    </div>
  );
};
