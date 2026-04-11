import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Upload, Clock, MapPin, Package, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const PLATFORMS = ['Blinkit', 'Swiggy Instamart', 'Amazon', 'Flipkart', 'Zepto', 'BigBasket', 'Myntra', 'Meesho'];
const LOCATIONS = ['Block 1','Block 2','Block 3','Block 5','Block 10','Block 15','Block 20','Block 25','Block 30','Block 40','Block 50','Block 60','Boys Hostel','Girls Hostel'];

export const ExternalPickup = () => {
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState('');
  const [orderId, setOrderId] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [isPaid, setIsPaid] = useState('yes');
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScreenshotSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshotPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!platform || !deliveryTime || !deliveryLocation) { toast.error('Fill all required fields'); return; }
    setLoading(true);
    try {
      await api.createExternalOrder({
        screenshot_url: screenshotPreview || '',
        delivery_time: deliveryTime,
        delivery_location: deliveryLocation,
        platform,
        order_id: orderId,
        is_paid: isPaid === 'yes'
      });
      toast.success('Pickup request submitted!');
      setShowForm(false);
      setPlatform(''); setOrderId(''); setDeliveryTime(''); setDeliveryLocation(''); setScreenshotPreview(null); setIsPaid('yes');
    } catch(e) { toast.error('Failed to submit'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Outfit', color: '#09090B' }}>External Pickup</h2>
          <p className="text-sm mt-1" style={{ color: '#52525B' }}>Get packages from Blinkit, Amazon, etc. delivered to your hostel</p>
        </div>
        <Button data-testid="new-pickup-request-btn" onClick={() => setShowForm(true)} className="rounded-full px-5 py-3 font-bold" style={{ backgroundColor: '#F97316', color: 'white', border: '2px solid #000', boxShadow: '3px 3px 0px rgba(0,0,0,1)' }}>
          <Upload className="w-4 h-4 mr-2" /> New Request
        </Button>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { step: '1', icon: Upload, text: 'Select platform & upload screenshot', color: '#3B82F6' },
          { step: '2', icon: Clock, text: 'Enter arrival time at LPU gate', color: '#F97316' },
          { step: '3', icon: Package, text: 'Agent picks up & delivers to you!', color: '#10B981' },
        ].map(s => (
          <Card key={s.step} className="neo-brutal rounded-2xl p-5" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: s.color }}>{s.step}</div>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <p className="text-sm font-medium">{s.text}</p>
          </Card>
        ))}
      </div>

      {/* Supported Platforms */}
      <Card className="neo-brutal rounded-2xl p-5" style={{ backgroundColor: '#FFFFFF' }}>
        <h3 className="font-bold mb-3">Supported Platforms</h3>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(app => (
            <span key={app} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#FEF3C7', border: '1.5px solid #000' }}>{app}</span>
          ))}
        </div>
      </Card>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl font-bold" style={{ fontFamily: 'Outfit' }}>New Pickup Request</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-3">
            <div>
              <label className="font-semibold text-sm mb-1.5 block">Platform *</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger data-testid="pickup-platform-select" className="border-2 border-black rounded-lg"><SelectValue placeholder="Where is the order from?" /></SelectTrigger>
                <SelectContent>{PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-sm mb-1.5 block">Order ID (optional)</label>
              <Input data-testid="pickup-order-id" value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="e.g., OD1234567890" className="border-2 border-black rounded-lg" />
            </div>

            <div>
              <label className="font-semibold text-sm mb-1.5 block">Payment Status *</label>
              <div className="flex gap-3">
                <button onClick={() => setIsPaid('yes')} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${isPaid === 'yes' ? 'border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'border-gray-200'}`} style={{ backgroundColor: isPaid === 'yes' ? '#F0FDF4' : '#FFF' }}>
                  <CheckCircle className="w-4 h-4" style={{ color: '#10B981' }} /><span className="text-sm font-semibold">Paid</span>
                </button>
                <button onClick={() => setIsPaid('no')} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${isPaid === 'no' ? 'border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'border-gray-200'}`} style={{ backgroundColor: isPaid === 'no' ? '#FEF2F2' : '#FFF' }}>
                  <XCircle className="w-4 h-4" style={{ color: '#EF4444' }} /><span className="text-sm font-semibold">COD</span>
                </button>
              </div>
            </div>

            <div>
              <label className="font-semibold text-sm mb-1.5 block">Expected Arrival *</label>
              <Input data-testid="pickup-time-input" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} placeholder="e.g., 4:30 PM today" className="border-2 border-black rounded-lg" />
            </div>

            <div>
              <label className="font-semibold text-sm mb-1.5 block">Your Location *</label>
              <Select value={deliveryLocation} onValueChange={setDeliveryLocation}>
                <SelectTrigger data-testid="pickup-location-select" className="border-2 border-black rounded-lg"><SelectValue placeholder="Select hostel/block" /></SelectTrigger>
                <SelectContent>{LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-semibold text-sm mb-1.5 block">Screenshot (optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-orange-400 transition-colors" onClick={() => document.getElementById('screenshot-input').click()}>
                {screenshotPreview ? <img src={screenshotPreview} alt="Screenshot" className="max-h-36 mx-auto rounded-lg" /> : <><Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" /><p className="text-xs text-gray-500">Upload order screenshot</p></>}
                <input id="screenshot-input" type="file" accept="image/*" className="hidden" onChange={handleScreenshotSelect} />
              </div>
            </div>

            <Button data-testid="submit-pickup-btn" onClick={handleSubmit} disabled={loading} className="w-full rounded-full py-5 font-bold" style={{ backgroundColor: '#F97316', color: 'white' }}>
              {loading ? 'Submitting...' : 'Submit Pickup Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
