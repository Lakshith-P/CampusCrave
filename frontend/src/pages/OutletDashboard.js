import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SortableOrderCard = ({ order, onStatusChange }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getElapsedTime = () => {
    const created = new Date(order.created_at);
    const now = new Date();
    const diffMinutes = Math.floor((now - created) / 1000 / 60);
    return `${diffMinutes} min ago`;
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        data-testid={`order-card-${order.id}`}
        className="p-4 mb-3 border-2 border-gray-200 rounded-md hover:shadow-lg transition-shadow cursor-move"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-sm">Order #{order.id.slice(0, 8)}</p>
            <p className="text-xs text-gray-500">{getElapsedTime()}</p>
          </div>
          <Badge className="text-xs">{order.items.length} items</Badge>
        </div>

        <div className="space-y-2 mb-3">
          {order.items.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <img src={item.image_url} alt={item.name} className="w-10 h-10 object-cover rounded" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                {item.special_instructions && (
                  <p className="text-xs text-blue-600 italic">Note: {item.special_instructions}</p>
                )}
              </div>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-gray-500">+{order.items.length - 2} more</p>
          )}
        </div>

        <div className="text-xs text-gray-600 mb-3">
          📍 {order.delivery_location}
        </div>

        <div className="flex gap-2">
          {order.status === 'incoming' && (
            <Button
              size="sm"
              onClick={() => onStatusChange(order.id, 'preparing')}
              className="flex-1 text-xs"
              style={{ backgroundColor: '#F59E0B', color: 'white' }}
            >
              Start Preparing
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button
              size="sm"
              onClick={() => onStatusChange(order.id, 'ready')}
              className="flex-1 text-xs"
              style={{ backgroundColor: '#10B981', color: 'white' }}
            >
              Mark Ready
            </Button>
          )}
          {order.status === 'ready' && (
            <Button
              size="sm"
              onClick={() => onStatusChange(order.id, 'picked_up')}
              className="flex-1 text-xs"
              style={{ backgroundColor: '#2563EB', color: 'white' }}
            >
              Mark Picked Up
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export const OutletDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ws, setWs] = useState(null);
  const [audioChime] = useState(new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjKJ0fPTgjMGHm7A7+OZSA=='));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadOrders();
    connectWebSocket();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const connectWebSocket = () => {
    const wsUrl = BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const socket = new WebSocket(`${wsUrl}/ws/outlet_${user?.id}`);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_order') {
        loadOrders();
        audioChime.play().catch(() => {});
        toast.success('🔔 New order received!');
      }
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated');
      loadOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const ordersByStatus = {
    incoming: orders.filter(o => o.status === 'incoming'),
    preparing: orders.filter(o => o.status === 'preparing'),
    ready: orders.filter(o => o.status === 'ready'),
    picked_up: orders.filter(o => o.status === 'picked_up')
  };

  return (
    <div className="min-h-screen dashboard-app" style={{ backgroundColor: '#F3F4F6' }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB' }}>
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Chivo', color: '#111827' }}>
                Outlet Dashboard
              </h1>
              <p className="text-sm text-gray-600">{user?.name}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="p-6 h-[calc(100vh-80px)] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
          {/* Incoming */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ fontFamily: 'Chivo', color: '#2563EB' }}>
                Incoming
              </h3>
              <Badge>{ordersByStatus.incoming.length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto pr-2" data-testid="incoming-column">
              {ordersByStatus.incoming.map(order => (
                <SortableOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </div>

          {/* Preparing */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ fontFamily: 'Chivo', color: '#F59E0B' }}>
                Preparing
              </h3>
              <Badge>{ordersByStatus.preparing.length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto pr-2" data-testid="preparing-column">
              {ordersByStatus.preparing.map(order => (
                <SortableOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </div>

          {/* Ready */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ fontFamily: 'Chivo', color: '#10B981' }}>
                Ready
              </h3>
              <Badge>{ordersByStatus.ready.length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto pr-2" data-testid="ready-column">
              {ordersByStatus.ready.map(order => (
                <SortableOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </div>

          {/* Picked Up */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ fontFamily: 'Chivo', color: '#6B7280' }}>
                Picked Up
              </h3>
              <Badge>{ordersByStatus.picked_up.length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto pr-2" data-testid="pickedup-column">
              {ordersByStatus.picked_up.map(order => (
                <SortableOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};