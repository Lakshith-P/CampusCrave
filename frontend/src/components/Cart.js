import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Trash2, MapPin, CreditCard, Smartphone, Wallet, Coins, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import confetti from 'canvas-confetti';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm', color: '#6366F1' },
  { id: 'card', label: 'Card', icon: CreditCard, description: 'Credit / Debit Card', color: '#3B82F6' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, description: 'Paytm, Amazon Pay', color: '#10B981' },
  { id: 'credits', label: 'Credits', icon: Coins, description: 'Use CampusCrave credits', color: '#F97316' },
];

export const Cart = ({ cartCount, onCartUpdate }) => {
  const [cartItems, setCartItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [userCredits, setUserCredits] = useState(100);

  useEffect(() => { loadCart(); loadUser(); }, [cartCount]);

  const loadCart = async () => { try { setCartItems((await api.getCart()).data); } catch(e) {} };
  const loadUser = async () => { try { const u = (await api.getMe()).data; setUserCredits(u.credits || 0); } catch(e) {} };

  const removeItem = async (itemId) => {
    try { await api.removeFromCart(itemId); toast.success('Item removed'); loadCart(); onCartUpdate(); } catch(e) {}
  };

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;
    try { await api.updateCartItem(itemId, { quantity: newQty }); loadCart(); } catch(e) {}
  };

  const getTotalAmount = () => cartItems.reduce((sum, item) => sum + ((item.menu_item?.price || 0) * item.quantity), 0);

  const handleProceedToPayment = () => {
    if (!deliveryLocation) { toast.error('Please select a delivery location'); return; }
    if (cartItems.length === 0) { toast.error('Your cart is empty'); return; }
    setShowCheckout(false);
    setShowPayment(true);
  };

  const handlePayment = async () => {
    const total = getTotalAmount();
    if (paymentMethod === 'credits' && userCredits < total) {
      toast.error(`Insufficient credits! You have ${userCredits} but need ${total}`);
      return;
    }
    setLoading(true);
    try {
      // Process payment
      await api.processPayment({ method: paymentMethod, amount: total });

      // Group items by venue and create orders
      const venueGroups = cartItems.reduce((acc, item) => {
        const venueId = item.menu_item?.venue_id;
        if (!acc[venueId]) acc[venueId] = [];
        acc[venueId].push(item);
        return acc;
      }, {});

      for (const [venueId, items] of Object.entries(venueGroups)) {
        const orderItems = items.map(item => ({
          menu_item_id: item.menu_item_id, name: item.menu_item?.name, quantity: item.quantity,
          price: item.menu_item?.price, special_instructions: item.special_instructions, image_url: item.menu_item?.image_url
        }));
        const totalAmount = items.reduce((sum, item) => sum + (item.menu_item?.price * item.quantity), 0);
        await api.createOrder({ items: orderItems, total_amount: totalAmount, delivery_location: deliveryLocation, venue_id: venueId, payment_method: paymentMethod });
      }

      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#F97316', '#FBBF24', '#10B981'] });
      toast.success('Order placed successfully!');
      setShowPayment(false);
      setDeliveryLocation('');
      setPaymentMethod('upi');
      onCartUpdate();
    } catch(e) { toast.error(e.response?.data?.detail || 'Payment failed'); } finally { setLoading(false); }
  };

  const locations = ['Block 1','Block 2','Block 3','Block 4','Block 5','Block 10','Block 15','Block 20','Block 25','Block 30','Block 35','Block 40','Block 45','Block 50','Block 55','Block 60','Boys Hostel','Girls Hostel'];
  const total = getTotalAmount();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Outfit', color: '#09090B' }}>Your Cart</h2>
        {cartItems.length > 0 && <span className="text-xl font-bold" style={{ color: '#F97316' }}>&#8377;{total.toFixed(0)}</span>}
      </div>

      {cartItems.length === 0 ? (
        <Card className="neo-brutal rounded-2xl p-12 text-center" style={{ backgroundColor: '#FFFFFF' }}>
          <p className="text-xl text-gray-500">Your cart is empty</p>
          <p className="text-sm text-gray-400 mt-2">Browse food courts and add items!</p>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {cartItems.map(item => (
              <Card key={item.id} className="neo-brutal rounded-2xl p-4" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="flex gap-4 items-center">
                  <img src={item.menu_item?.image_url} alt={item.menu_item?.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base truncate">{item.menu_item?.name}</h3>
                    {item.special_instructions && <p className="text-xs text-gray-500 italic truncate">Note: {item.special_instructions}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                      <span className="font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold" style={{ color: '#F97316' }}>&#8377;{((item.menu_item?.price || 0) * item.quantity).toFixed(0)}</p>
                    <button onClick={() => removeItem(item.id)} className="mt-2 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="neo-brutal rounded-2xl p-4" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex justify-between mb-1"><span className="text-sm">Subtotal</span><span className="font-semibold">&#8377;{total.toFixed(0)}</span></div>
            <div className="flex justify-between mb-1"><span className="text-sm">Delivery</span><span className="font-semibold text-green-600">FREE</span></div>
            <div className="border-t pt-2 mt-2 flex justify-between"><span className="font-bold">Total</span><span className="font-bold text-xl" style={{ color: '#F97316' }}>&#8377;{total.toFixed(0)}</span></div>
          </Card>

          <Button data-testid="checkout-button" onClick={() => setShowCheckout(true)} className="w-full rounded-full py-6 text-lg font-bold" style={{ backgroundColor: '#F97316', color: 'white' }}>
            Proceed to Checkout
          </Button>
        </>
      )}

      {/* Location Selection */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold" style={{ fontFamily: 'Outfit' }}>Delivery Location</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <Select value={deliveryLocation} onValueChange={setDeliveryLocation}>
              <SelectTrigger data-testid="location-select" className="border-2 border-black rounded-lg"><SelectValue placeholder="Choose your block / hostel" /></SelectTrigger>
              <SelectContent>{locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}</SelectContent>
            </Select>
            <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Estimated delivery: 20-25 mins</p>
            <Button data-testid="proceed-to-payment-btn" onClick={handleProceedToPayment} className="w-full rounded-full py-5 font-bold" style={{ backgroundColor: '#F97316', color: 'white' }}>Choose Payment Method</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Method Selection */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-xl font-bold" style={{ fontFamily: 'Outfit' }}>Payment</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#FEF3C7' }}>
              <p className="text-sm">Amount to Pay</p>
              <p className="text-3xl font-bold" style={{ color: '#F97316' }}>&#8377;{total.toFixed(0)}</p>
            </div>

            <div className="space-y-2">
              {PAYMENT_METHODS.map(method => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                const isDisabled = method.id === 'credits' && userCredits < total;
                return (
                  <button
                    key={method.id}
                    data-testid={`payment-${method.id}`}
                    onClick={() => !isDisabled && setPaymentMethod(method.id)}
                    disabled={isDisabled}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'border-gray-200'} ${isDisabled ? 'opacity-50' : ''}`}
                    style={{ backgroundColor: isSelected ? '#FEF3C7' : '#FFFFFF' }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${method.color}20` }}>
                      <Icon className="w-5 h-5" style={{ color: method.color }} />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-bold text-sm">{method.label}</p>
                      <p className="text-xs text-gray-500">{method.description}</p>
                      {method.id === 'credits' && <p className="text-xs font-medium" style={{ color: userCredits >= total ? '#10B981' : '#EF4444' }}>Balance: {userCredits} credits</p>}
                    </div>
                    {isSelected && <div className="w-5 h-5 rounded-full" style={{ backgroundColor: method.color }} />}
                  </button>
                );
              })}
            </div>

            <Button data-testid="confirm-payment-btn" onClick={handlePayment} disabled={loading} className="w-full rounded-full py-5 font-bold text-lg" style={{ backgroundColor: '#F97316', color: 'white' }}>
              {loading ? 'Processing...' : `Pay &#8377;${total.toFixed(0)}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function Clock(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
