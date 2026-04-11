import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LogOut, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await api.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    }
  };

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}>
        <p style={{ color: '#F8FAFC' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-app" style={{ backgroundColor: '#0A0A0A' }}>
      {/* Header */}
      <header className="glassmorphism" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Chivo', color: '#F8FAFC' }}>
                Admin Dashboard
              </h1>
              <p className="text-sm" style={{ color: '#94A3B8' }}>{user?.name}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-5 h-5" style={{ color: '#F8FAFC' }} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card
            className="glassmorphism p-6 rounded-xl"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            data-testid="total-orders-card"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
              >
                <ShoppingBag className="w-6 h-6" style={{ color: '#3B82F6' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Total Orders</p>
                <p className="text-3xl font-bold" style={{ color: '#F8FAFC' }}>
                  {analytics.total_orders}
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="glassmorphism p-6 rounded-xl"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            data-testid="total-revenue-card"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}
              >
                <DollarSign className="w-6 h-6" style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Total Revenue</p>
                <p className="text-3xl font-bold" style={{ color: '#F8FAFC' }}>
                  ₹{analytics.total_revenue.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="glassmorphism p-6 rounded-xl"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            data-testid="avg-order-card"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
              >
                <TrendingUp className="w-6 h-6" style={{ color: '#10B981' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Avg Order Value</p>
                <p className="text-3xl font-bold" style={{ color: '#F8FAFC' }}>
                  ₹{analytics.total_orders > 0 ? (analytics.total_revenue / analytics.total_orders).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Orders by Venue Chart */}
        <Card
          className="glassmorphism p-6 rounded-xl"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          data-testid="venue-chart"
        >
          <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Chivo', color: '#F8FAFC' }}>
            Orders by Venue
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.venue_stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(24px)'
                }}
              />
              <Bar dataKey="orders" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Venue Management */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Chivo', color: '#F8FAFC' }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              className="p-6 rounded-xl text-left justify-start"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#F8FAFC' }}
            >
              <div>
                <p className="font-bold text-lg">Manage Venues</p>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Add, edit or remove food courts and stores</p>
              </div>
            </Button>

            <Button
              className="p-6 rounded-xl text-left justify-start"
              style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#F8FAFC' }}
            >
              <div>
                <p className="font-bold text-lg">Manage Users</p>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Assign roles and manage accounts</p>
              </div>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};