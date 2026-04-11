import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const OrderTracking = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    loadOrders();
    connectWebSocket();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    const wsUrl = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const socket = new WebSocket(`${wsUrl}/ws/${token}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'order_update' || data.type === 'location_update') {
        loadOrders();
        if (selectedOrder && data.order.id === selectedOrder.id) {
          setSelectedOrder(data.order);
        }
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(socket);
  };

  const loadOrders = async () => {
    try {
      const response = await api.getOrders();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      incoming: 'bg-blue-500',
      preparing: 'bg-yellow-500',
      ready: 'bg-green-500',
      picked_up: 'bg-purple-500',
      delivered: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status) => {
    const labels = {
      incoming: 'Order Received',
      preparing: 'Preparing',
      ready: 'Ready for Pickup',
      picked_up: 'Out for Delivery',
      delivered: 'Delivered'
    };
    return labels[status] || status;
  };

  const handleReviewSubmit = async () => {
    try {
      await api.createReview({
        order_id: selectedOrder.id,
        venue_id: selectedOrder.venue_id,
        rating,
        comment
      });
      toast.success('Thank you for your review!');
      setShowReviewModal(false);
      setRating(5);
      setComment('');
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold" style={{ fontFamily: 'Outfit', color: '#09090B' }}>
        📦 My Orders
      </h2>

      {orders.length === 0 ? (
        <Card className="neo-brutal rounded-2xl p-12 text-center" style={{ backgroundColor: '#FFFFFF' }}>
          <p className="text-xl text-gray-500">No orders yet</p>
          <p className="text-sm text-gray-400 mt-2">Start ordering delicious food!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              data-testid={`order-card-${order.id}`}
              onClick={() => setSelectedOrder(order)}
              className="neo-brutal rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-shadow"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge className={`${getStatusColor(order.status)} text-white`}>
                  {getStatusLabel(order.status)}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <p className="text-xs text-gray-500">+{order.items.length - 2} more items</p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold text-lg" style={{ color: '#F97316' }}>
                  ₹{order.total_amount.toFixed(2)}
                </span>
                <span className="text-sm text-gray-600">📍 {order.delivery_location}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Modal with Live Tracking */}
      <Dialog open={selectedOrder !== null} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Outfit' }}>
              Order Tracking
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Campus Map */}
              <div className="bg-gray-100 rounded-lg p-6 h-64 relative">
                <svg viewBox="0 0 400 300" className="w-full h-full">
                  {/* Campus outline */}
                  <rect x="50" y="50" width="300" height="200" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2" />
                  
                  {/* Outlet (origin) */}
                  <circle cx="100" cy="100" r="8" fill="#F97316" />
                  <text x="100" y="125" textAnchor="middle" fontSize="10" fill="#374151">Outlet</text>
                  
                  {/* Delivery location (destination) */}
                  <circle cx="300" cy="200" r="8" fill="#10B981" />
                  <text x="300" y="225" textAnchor="middle" fontSize="10" fill="#374151">{selectedOrder.delivery_location}</text>
                  
                  {/* Delivery agent (moving) */}
                  <circle
                    cx={100 + (selectedOrder.agent_location?.x || 0) * 2}
                    cy={100 + (selectedOrder.agent_location?.y || 0) * 1.5}
                    r="10"
                    fill="#FBBF24"
                  />
                  <text
                    x={100 + (selectedOrder.agent_location?.x || 0) * 2}
                    y={95 + (selectedOrder.agent_location?.y || 0) * 1.5}
                    textAnchor="middle"
                    fontSize="16"
                  >
                    🚴
                  </text>
                </svg>
              </div>

              {/* Order Timeline */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                {['incoming', 'preparing', 'ready', 'picked_up', 'delivered'].map((status, idx) => {
                  const isCompleted = ['incoming', 'preparing', 'ready', 'picked_up', 'delivered'].indexOf(selectedOrder.status) >= idx;
                  return (
                    <div key={status} className="relative flex items-center gap-4 mb-6">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        {isCompleted && <span className="text-white text-sm">✓</span>}
                      </div>
                      <div>
                        <p className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {getStatusLabel(status)}
                        </p>
                        {isCompleted && (
                          <p className="text-xs text-gray-500">
                            {new Date(selectedOrder.updated_at).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-bold mb-3">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                        <div>
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.status === 'delivered' && (
                <Button
                  onClick={() => setShowReviewModal(true)}
                  className="w-full rounded-full py-6"
                  style={{ backgroundColor: '#F97316', color: 'white' }}
                >
                  Rate this Order
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Outfit' }}>
              Rate Your Experience
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div>
              <label className="font-semibold mb-2 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer ${
                      star <= rating ? 'fill-current text-yellow-400' : 'text-gray-300'
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold mb-2 block">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border-2 border-black rounded-lg p-3"
                rows={4}
                placeholder="Share your experience..."
              />
            </div>

            <Button
              onClick={handleReviewSubmit}
              className="w-full rounded-full py-6"
              style={{ backgroundColor: '#F97316', color: 'white' }}
            >
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};