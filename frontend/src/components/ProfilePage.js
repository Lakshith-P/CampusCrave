import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User, Package, CreditCard, LogOut, Star, Coins, Gift, ChevronRight, Clock } from 'lucide-react';
import { toast } from 'sonner';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => { loadData(); }, []);
  const loadData = async () => {
    try {
      const [u, o] = await Promise.all([api.getMe(), api.getOrders()]);
      setProfile(u.data);
      setOrders(o.data);
    } catch(e) {}
  };

  const getStatusColor = (s) => ({ incoming: '#3B82F6', preparing: '#F59E0B', ready: '#10B981', picked_up: '#8B5CF6', delivered: '#6B7280' }[s] || '#6B7280');

  const sections = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'Past Orders', icon: Package },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="neo-brutal rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: '#F97316', color: '#FFF' }}>
            {profile?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit' }}>{profile?.name}</h2>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <div className="flex gap-4 mt-2">
              <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#F97316' }}>{profile?.credits || 0} Credits</span>
              <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#F0FDF4', color: '#10B981' }}>{profile?.loyalty_points || 0} Points</span>
            </div>
          </div>
          <Button onClick={logout} variant="outline" className="rounded-full border-2 border-black" data-testid="profile-logout">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </Card>

      {/* Section Tabs */}
      <div className="flex gap-2">
        {sections.map(s => {
          const Icon = s.icon;
          const active = activeSection === s.id;
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${active ? '' : ''}`}
              style={{ backgroundColor: active ? '#09090B' : '#FFFFFF', color: active ? '#FFF' : '#09090B', border: '2px solid #000', boxShadow: active ? '3px 3px 0px rgba(0,0,0,1)' : 'none' }}>
              <Icon className="w-4 h-4" />{s.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="neo-brutal rounded-2xl p-4 text-center" style={{ backgroundColor: '#FFF' }}>
            <Package className="w-6 h-6 mx-auto mb-2" style={{ color: '#3B82F6' }} />
            <p className="text-2xl font-bold">{orders.length}</p>
            <p className="text-xs text-gray-500">Total Orders</p>
          </Card>
          <Card className="neo-brutal rounded-2xl p-4 text-center" style={{ backgroundColor: '#FFF' }}>
            <Coins className="w-6 h-6 mx-auto mb-2" style={{ color: '#F97316' }} />
            <p className="text-2xl font-bold">{profile?.credits || 0}</p>
            <p className="text-xs text-gray-500">Credits</p>
          </Card>
          <Card className="neo-brutal rounded-2xl p-4 text-center" style={{ backgroundColor: '#FFF' }}>
            <Star className="w-6 h-6 mx-auto mb-2" style={{ color: '#FBBF24' }} />
            <p className="text-2xl font-bold">{profile?.loyalty_points || 0}</p>
            <p className="text-xs text-gray-500">Loyalty Points</p>
          </Card>
          <Card className="neo-brutal rounded-2xl p-4 text-center" style={{ backgroundColor: '#FFF' }}>
            <Gift className="w-6 h-6 mx-auto mb-2" style={{ color: '#10B981' }} />
            <p className="text-2xl font-bold">{profile?.referral_count || 0}</p>
            <p className="text-xs text-gray-500">Referrals</p>
          </Card>
        </div>
      )}

      {/* Past Orders */}
      {activeSection === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? <p className="text-center text-gray-500 py-8">No orders yet</p> : orders.map(order => (
            <Card key={order.id} className="neo-brutal rounded-2xl p-4" style={{ backgroundColor: '#FFF' }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-sm">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <Badge style={{ backgroundColor: getStatusColor(order.status), color: '#FFF' }}>{order.status}</Badge>
              </div>
              <div className="flex items-center gap-2 mb-2">
                {order.items?.slice(0, 3).map((item, i) => <img key={i} src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />)}
                {order.items?.length > 3 && <span className="text-xs text-gray-500">+{order.items.length - 3}</span>}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold" style={{ color: '#F97316' }}>{'\u20B9'}{order.total_amount?.toFixed(0)}</span>
                <span className="text-xs text-gray-500">{order.delivery_location}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Payments */}
      {activeSection === 'payments' && (
        <div className="space-y-3">
          {orders.length === 0 ? <p className="text-center text-gray-500 py-8">No payment history</p> : orders.map(order => (
            <Card key={order.id} className="p-4 rounded-xl border" style={{ backgroundColor: '#FFF' }}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()} - {order.payment_method || 'UPI'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: '#F97316' }}>{'\u20B9'}{order.total_amount?.toFixed(0)}</p>
                  <Badge variant="outline" className="text-xs">{order.status === 'delivered' ? 'Completed' : 'Processing'}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
