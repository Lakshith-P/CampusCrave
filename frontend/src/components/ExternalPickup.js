import React, { useState } from 'react';
import { api } from '../utils/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Upload, Package, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export const ExternalPickup = () => {
  const [showForm, setShowForm] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const locations = [
    'Block 1', 'Block 2', 'Block 3', 'Block 4', 'Block 5',
    'Block 10', 'Block 15', 'Block 20', 'Block 25', 'Block 30',
    'Boys Hostel', 'Girls Hostel'
  ];

  const handleScreenshotSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!screenshotPreview || !deliveryTime || !deliveryLocation) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await api.createExternalOrder({
        screenshot_url: screenshotPreview,
        delivery_time: deliveryTime,
        delivery_location: deliveryLocation
      });
      toast.success('Pickup request submitted! An agent will collect your package.');
      setShowForm(false);
      setScreenshotPreview(null);
      setDeliveryTime('');
      setDeliveryLocation('');
    } catch (error) {
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'Outfit', color: '#09090B' }}>
            External Pickup
          </h2>
          <p className="text-sm mt-1" style={{ color: '#52525B' }}>
            Get your Blinkit, Swiggy, Amazon packages delivered to your hostel
          </p>
        </div>
        <Button
          data-testid="new-pickup-request-btn"
          onClick={() => setShowForm(true)}
          className="rounded-full px-6 py-3 font-bold"
          style={{ backgroundColor: '#F97316', color: 'white' }}
        >
          <Upload className="w-5 h-5 mr-2" />
          New Pickup Request
        </Button>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="neo-brutal rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
              <Upload className="w-5 h-5" style={{ color: '#F97316' }} />
            </div>
            <h3 className="font-bold">Step 1</h3>
          </div>
          <p className="text-sm" style={{ color: '#52525B' }}>Upload a screenshot of your external order</p>
        </Card>

        <Card className="neo-brutal rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
              <Clock className="w-5 h-5" style={{ color: '#F97316' }} />
            </div>
            <h3 className="font-bold">Step 2</h3>
          </div>
          <p className="text-sm" style={{ color: '#52525B' }}>Enter estimated arrival time at LPU gate</p>
        </Card>

        <Card className="neo-brutal rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
              <MapPin className="w-5 h-5" style={{ color: '#F97316' }} />
            </div>
            <h3 className="font-bold">Step 3</h3>
          </div>
          <p className="text-sm" style={{ color: '#52525B' }}>A campus agent picks it up and delivers to you!</p>
        </Card>
      </div>

      {/* Supported Apps */}
      <Card className="neo-brutal rounded-2xl p-6" style={{ backgroundColor: '#FFFFFF' }}>
        <h3 className="font-bold text-lg mb-3">Supported Platforms</h3>
        <div className="flex flex-wrap gap-3">
          {['Blinkit', 'Swiggy Instamart', 'Amazon', 'Flipkart', 'Zepto', 'BigBasket'].map(app => (
            <span
              key={app}
              className="px-4 py-2 rounded-full text-sm font-medium border-2 border-black"
              style={{ backgroundColor: '#FEFCE8' }}
            >
              {app}
            </span>
          ))}
        </div>
      </Card>

      {/* Pickup Form Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Outfit' }}>
              New Pickup Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Screenshot Upload */}
            <div>
              <label className="font-semibold mb-2 block">Order Screenshot</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 transition-colors"
                onClick={() => document.getElementById('screenshot-input').click()}
              >
                {screenshotPreview ? (
                  <img src={screenshotPreview} alt="Screenshot" className="max-h-48 mx-auto rounded-lg" />
                ) : (
                  <div>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Click to upload screenshot</p>
                  </div>
                )}
                <input
                  id="screenshot-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleScreenshotSelect}
                />
              </div>
            </div>

            {/* Delivery Time */}
            <div>
              <label className="font-semibold mb-2 block">Expected Arrival Time</label>
              <Input
                data-testid="pickup-time-input"
                type="text"
                placeholder="e.g., 4:30 PM today"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="border-2 border-black rounded-lg"
              />
            </div>

            {/* Delivery Location */}
            <div>
              <label className="font-semibold mb-2 block">Your Location</label>
              <Select value={deliveryLocation} onValueChange={setDeliveryLocation}>
                <SelectTrigger data-testid="pickup-location-select" className="border-2 border-black rounded-lg">
                  <SelectValue placeholder="Select your hostel/block" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              data-testid="submit-pickup-btn"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-full py-6 text-lg font-bold"
              style={{ backgroundColor: '#F97316', color: 'white' }}
            >
              {loading ? 'Submitting...' : 'Submit Pickup Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
