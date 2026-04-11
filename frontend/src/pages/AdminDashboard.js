import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LogOut, TrendingUp, DollarSign, ShoppingBag, Users, Percent, Gift, Award } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['#3B82F6', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#FBBF24', '#EC4899', '#14B8A6'];

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => { loadAnalytics(); }, []);
  const loadAnalytics = async () => { try { setAnalytics((await api.getAnalytics()).data); } catch(e) { toast.error('Failed to load analytics'); } };

  if (!analytics) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0A0A' }}><p style={{ color: '#F8FAFC' }}>Loading...</p></div>;

  const statCards = [
    { icon: ShoppingBag, label: 'Total Orders', value: analytics.total_orders, color: '#3B82F6' },
    { icon: ShoppingBag, label: "Today's Orders", value: analytics.today_orders, color: '#8B5CF6' },
    { icon: DollarSign, label: 'Total Revenue', value: `\u20B9${analytics.total_revenue?.toFixed(0)}`, color: '#10B981' },
    { icon: DollarSign, label: "Today's Revenue", value: `\u20B9${analytics.today_revenue?.toFixed(0)}`, color: '#F59E0B' },
    { icon: Percent, label: 'Platform Profit', value: `\u20B9${analytics.platform_profit?.toFixed(0)}`, color: '#EF4444' },
    { icon: Percent, label: 'Commission Rate', value: `${analytics.commission_rate}%`, color: '#F97316' },
    { icon: Users, label: 'Total Students', value: analytics.total_users, color: '#6366F1' },
    { icon: Gift, label: 'Total Referrals', value: analytics.total_referrals, color: '#EC4899' },
  ];

  const venueRevenueData = analytics.venue_stats?.filter(v => v.revenue > 0) || [];

  return (
    <div className="min-h-screen dashboard-app" style={{ backgroundColor: '#0A0A0A' }}>
      <header className="glassmorphism sticky top-0 z-40" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Chivo', color: '#F8FAFC' }}>CampusCrave Admin</h1>
              <p className="text-xs" style={{ color: '#94A3B8' }}>{user?.name}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} data-testid="admin-logout"><LogOut className="w-5 h-5" style={{ color: '#F8FAFC' }} /></Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="glassmorphism p-4 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }} data-testid={`stat-card-${idx}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#94A3B8' }}>{stat.label}</p>
                    <p className="text-lg font-bold" style={{ color: '#F8FAFC' }}>{stat.value}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders by Venue */}
          <Card className="glassmorphism p-6 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }} data-testid="venue-orders-chart">
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Chivo', color: '#F8FAFC' }}>Orders by Venue</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.venue_stats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                <YAxis stroke="#94A3B8" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F8FAFC' }} />
                <Bar dataKey="orders" fill="#3B82F6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue Distribution Pie */}
          {venueRevenueData.length > 0 && (
            <Card className="glassmorphism p-6 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }} data-testid="revenue-pie-chart">
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Chivo', color: '#F8FAFC' }}>Revenue Distribution</h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={venueRevenueData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {venueRevenueData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F8FAFC' }} formatter={(value) => `\u20B9${value.toFixed(0)}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* Top Items & Platform Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Items */}
          {analytics.top_items?.length > 0 && (
            <Card className="glassmorphism p-6 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Chivo', color: '#F8FAFC' }}>Top Selling Items</h2>
              <div className="space-y-3">
                {analytics.top_items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${PIE_COLORS[idx]}20`, color: PIE_COLORS[idx] }}>#{idx + 1}</span>
                      <span className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{item.name}</span>
                    </div>
                    <Badge style={{ backgroundColor: `${PIE_COLORS[idx]}20`, color: PIE_COLORS[idx] }}>{item.count} sold</Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Platform Summary */}
          <Card className="glassmorphism p-6 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Chivo', color: '#F8FAFC' }}>Platform Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <span className="text-sm" style={{ color: '#94A3B8' }}>Gross Revenue</span>
                <span className="font-bold" style={{ color: '#10B981' }}>{'\u20B9'}{analytics.total_revenue?.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <span className="text-sm" style={{ color: '#94A3B8' }}>Platform Profit ({analytics.commission_rate}%)</span>
                <span className="font-bold" style={{ color: '#EF4444' }}>{'\u20B9'}{analytics.platform_profit?.toFixed(0)}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                <span className="text-sm" style={{ color: '#94A3B8' }}>Registered Students</span>
                <span className="font-bold" style={{ color: '#6366F1' }}>{analytics.total_users}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
                <span className="text-sm" style={{ color: '#94A3B8' }}>Successful Referrals</span>
                <span className="font-bold" style={{ color: '#EC4899' }}>{analytics.total_referrals}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                <span className="text-sm" style={{ color: '#94A3B8' }}>Active Venues</span>
                <span className="font-bold" style={{ color: '#F59E0B' }}>{analytics.venue_stats?.length || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};
