import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import confetti from 'canvas-confetti';

export const Cart = ({ cartCount, onCartUpdate }) => {
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCart();
  }, [cartCount]);

  const loadCart = async () => {
    try {
      const response = await api.getCart();
      setCartItems(response.data);
    } catch (error) {
      toast.error('Failed to load cart');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.removeFromCart(itemId);
      toast.success('Item removed from cart');
      loadCart();
      onCartUpdate();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const getTotalAmount = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.menu_item?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = async () => {
    if (!deliveryLocation) {
      toast.error('Please select a delivery location');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      // Group items by venue
      const venueGroups = cartItems.reduce((acc, item) => {
        const venueId = item.menu_item?.venue_id;
        if (!acc[venueId]) acc[venueId] = [];
        acc[venueId].push(item);
        return acc;
      }, {});

      // Create order for each venue
      for (const [venueId, items] of Object.entries(venueGroups)) {
        const orderItems = items.map(item => ({
          menu_item_id: item.menu_item_id,
          name: item.menu_item?.name,
          quantity: item.quantity,
          price: item.menu_item?.price,
          special_instructions: item.special_instructions,
          image_url: item.menu_item?.image_url
        }));

        const totalAmount = items.reduce((sum, item) => sum + (item.menu_item?.price * item.quantity), 0);

        await api.createOrder({
          items: orderItems,
          total_amount: totalAmount,
          delivery_location: deliveryLocation,
          venue_id: venueId
        });
      }

      // Confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success('🎉 Order placed successfully!');
      setShowCheckout(false);
      setDeliveryLocation('');
      onCartUpdate();
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const locations = [
    'Block 1', 'Block 2', 'Block 3', 'Block 4', 'Block 5',
    'Block 10', 'Block 15', 'Block 20', 'Block 25', 'Block 30',
    'Boys Hostel', 'Girls Hostel'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold" style={{ fontFamily: 'Outfit', color: '#09090B' }}>
          🛒 Your Cart
        </h2>
        <span className="text-xl font-semibold" style={{ color: '#F97316' }}>
          Total: ₹{getTotalAmount().toFixed(2)}
        </span>
      </div>

      {cartItems.length === 0 ? (
        <Card className="neo-brutal rounded-2xl p-12 text-center" style={{ backgroundColor: '#FFFFFF' }}>
          <p className="text-xl text-gray-500">Your cart is empty</p>
          <p className="text-sm text-gray-400 mt-2">Start adding delicious items!</p>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="neo-brutal rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="flex gap-4">
                  <img
                    src={item.menu_item?.image_url}
                    alt={item.menu_item?.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.menu_item?.name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    {item.special_instructions && (
                      <p className="text-sm text-gray-500 italic">Note: {item.special_instructions}</p>
                    )}
                    <p className="font-bold mt-2" style={{ color: '#F97316' }}>
                      ₹{((item.menu_item?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Button
            data-testid="checkout-button"
            onClick={() => setShowCheckout(true)}
            className="w-full rounded-full py-6 text-lg font-bold"
            style={{ backgroundColor: '#F97316', color: 'white' }}
          >
            Proceed to Checkout
          </Button>
        </>
      )}

      {/* Checkout Modal */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Outfit' }}>
              Select Delivery Location
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div>
              <label className="font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Delivery Location
              </label>
              <Select value={deliveryLocation} onValueChange={setDeliveryLocation}>
                <SelectTrigger data-testid="location-select" className="mt-2 border-2 border-black rounded-lg">
                  <SelectValue placeholder="Choose your location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{getTotalAmount().toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Delivery:</span>
                <span className="font-semibold text-green-600">FREE</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-xl" style={{ color: '#F97316' }}>
                  ₹{getTotalAmount().toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">⏱️ Estimated delivery: 20-25 mins</p>
            </div>

            <Button
              data-testid="confirm-order-button"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-full py-6 text-lg font-bold"
              style={{ backgroundColor: '#F97316', color: 'white' }}
            >
              {loading ? 'Placing Order...' : 'Confirm Order'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};