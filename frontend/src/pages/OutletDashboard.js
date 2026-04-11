import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LogOut, DollarSign, ShoppingBag, Star, TrendingUp, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const OrderCard = ({ order, onStatusChange }) => {
  const getElapsedTime = () => {
    const diff = Math.floor((Date.now() - new Date(order.created_at)) / 60000);
    return diff < 1 ? 'Just now' : `${diff}m ago`;
  };

  return (
    <Card data-testid={`order-card-${order.id}`} className="p-4 mb-3 border rounded-lg hover:shadow-md transition-shadow" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold text-sm">#{order.id.slice(0, 8)}</p>
          <p className="text-xs text-gray-500">{getElapsedTime()}</p>
        </div>
        <Badge className="text-xs">{order.items.length} items</Badge>
      </div>
      <div className="space-y-1.5 mb-2">
        {order.items.slice(0, 2).map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <img src={item.image_url} alt={item.name} className="w-8 h-8 object-cover rounded" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{item.name} x{item.quantity}</p>
              {item.special_instructions && <p className="text-xs text-blue-600 italic truncate">{item.special_instructions}</p>}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
        <span>&#8377;{order.total_amount?.toFixed(0)}</span>
        <span>{order.delivery_location}</span>
      </div>
      <div className="flex gap-2">
        {order.status === 'incoming' && <Button size="sm" onClick={() => onStatusChange(order.id, 'preparing')} className="flex-1 text-xs rounded-lg" style={{ backgroundColor: '#F59E0B', color: 'white' }}>Start Preparing</Button>}
        {order.status === 'preparing' && <Button size="sm" onClick={() => onStatusChange(order.id, 'ready')} className="flex-1 text-xs rounded-lg" style={{ backgroundColor: '#10B981', color: 'white' }}>Mark Ready</Button>}
        {order.status === 'ready' && <Button size="sm" onClick={() => onStatusChange(order.id, 'picked_up')} className="flex-1 text-xs rounded-lg" style={{ backgroundColor: '#2563EB', color: 'white' }}>Picked Up</Button>}
      </div>
    </Card>
  );
};

export const OutletDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeView, setActiveView] = useState('board');

  useEffect(() => {
    loadOrders();
    loadAnalytics();
    const wsUrl = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const socket = new WebSocket(`${wsUrl}/ws/outlet_${user?.id}`);
    socket.onmessage = () => { loadOrders(); loadAnalytics(); toast.success('New order received!'); };
    return () => socket.close();
  }, []);

  const loadOrders = async () => { try { setOrders((await api.getOrders()).data); } catch(e) {} };
  const loadAnalytics = async () => { try { setAnalytics((await api.getOutletAnalytics()).data); } catch(e) {} };

  const handleStatusChange = async (orderId, newStatus) => {
    try { await api.updateOrderStatus(orderId, newStatus); toast.success('Status updated'); loadOrders(); loadAnalytics(); } catch(e) { toast.error('Failed'); }
  };

  const ordersByStatus = {
    incoming: orders.filter(o => o.status === 'incoming'),
    preparing: orders.filter(o => o.status === 'preparing'),
    ready: orders.filter(o => o.status === 'ready'),
    picked_up: orders.filter(o => o.status === 'picked_up'),
  };

  const columns = [
    { key: 'incoming', label: 'Incoming', color: '#2563EB' },
    { key: 'preparing', label: 'Preparing', color: '#F59E0B' },
    { key: 'ready', label: 'Ready', color: '#10B981' },
    { key: 'picked_up', label: 'Picked Up', color: '#6B7280' },
  ];

  return (
    <div className="min-h-screen dashboard-app" style={{ backgroundColor: '#F3F4F6' }}>
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <div className="px-4 sm:px-6 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Chivo', color: '#111827' }}>Outlet Dashboard</h1>
              <p className="text-xs text-gray-500">{user?.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setActiveView(activeView === 'board' ? 'stats' : 'board')} variant="outline" className="text-xs rounded-lg">
                {activeView === 'board' ? 'View Stats' : 'View Orders'}
              </Button>
              <Button variant="ghost" size="icon" onClick={logout} data-testid="outlet-logout"><LogOut className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      {analytics && (
        <div className="px-4 sm:px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" style={{ color: '#2563EB' }} />
              <div><p className="text-xs text-gray-500">Today's Orders</p><p className="font-bold text-lg">{analytics.today_orders}</p></div>
            </div>
          </Card>
          <Card className="p-3 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" style={{ color: '#10B981' }} />
              <div><p className="text-xs text-gray-500">Today's Earnings</p><p className="font-bold text-lg">&#8377;{analytics.today_earnings?.toFixed(0)}</p></div>
            </div>
          </Card>
          <Card className="p-3 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" style={{ color: '#FBBF24' }} />
              <div><p className="text-xs text-gray-500">Avg Rating</p><p className="font-bold text-lg">{analytics.avg_rating || '-'}</p></div>
            </div>
          </Card>
          <Card className="p-3 rounded-lg" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#F97316' }} />
              <div><p className="text-xs text-gray-500">Net Earnings</p><p className="font-bold text-lg">&#8377;{analytics.net_earnings?.toFixed(0)}</p></div>
            </div>
          </Card>
        </div>
      )}

      <main className="px-4 sm:px-6 pb-6">
        {activeView === 'board' ? (
          /* Kanban Board */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ height: 'calc(100vh - 200px)' }}>
            {columns.map(col => (
              <div key={col.key} className="flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.color }} />
                    <h3 className="font-bold text-sm" style={{ fontFamily: 'Chivo' }}>{col.label}</h3>
                  </div>
                  <Badge variant="outline" className="text-xs">{ordersByStatus[col.key].length}</Badge>
                </div>
                <div className="flex-1 overflow-y-auto rounded-lg p-2" style={{ backgroundColor: '#F9FAFB' }} data-testid={`${col.key}-column`}>
                  {ordersByStatus[col.key].length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">No orders</p>
                  ) : (
                    ordersByStatus[col.key].map(order => <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />)
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Stats View */
          <div className="space-y-6 mt-4">
            {analytics && (
              <>
                {/* Revenue Summary */}
                <Card className="p-6 rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
                  <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Chivo' }}>Revenue Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4' }}>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold" style={{ color: '#10B981' }}>&#8377;{analytics.total_earnings?.toFixed(0)}</p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                      <p className="text-sm text-gray-600">Net After Commission ({analytics.commission_rate}%)</p>
                      <p className="text-2xl font-bold" style={{ color: '#F97316' }}>&#8377;{analytics.net_earnings?.toFixed(0)}</p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#EFF6FF' }}>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold" style={{ color: '#2563EB' }}>{analytics.total_orders}</p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}>
                      <p className="text-sm text-gray-600">Platform Commission</p>
                      <p className="text-2xl font-bold" style={{ color: '#EF4444' }}>&#8377;{analytics.commission_paid?.toFixed(0)}</p>
                    </div>
                  </div>
                </Card>

                {/* Top Items */}
                {analytics.top_items?.length > 0 && (
                  <Card className="p-6 rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
                    <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Chivo' }}>Top Selling Items</h3>
                    <div className="space-y-3">
                      {analytics.top_items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: idx === 0 ? '#F97316' : '#E5E7EB', color: idx === 0 ? 'white' : '#374151' }}>#{idx + 1}</span>
                            <span className="font-medium text-sm">{item.name}</span>
                          </div>
                          <Badge variant="outline">{item.count} sold</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Recent Reviews */}
                {analytics.recent_reviews?.length > 0 && (
                  <Card className="p-6 rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
                    <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'Chivo' }}>Customer Reviews ({analytics.total_reviews})</h3>
                    <div className="space-y-4">
                      {analytics.recent_reviews.map(review => (
                        <div key={review.id} className="border-b pb-3 last:border-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />)}</div>
                            <span className="text-xs text-gray-500">{review.user_name}</span>
                          </div>
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
