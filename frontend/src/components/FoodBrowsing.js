import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export const FoodBrowsing = ({ onAddToCart }) => {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const response = await api.getVenues();
      setVenues(response.data);
    } catch (error) {
      toast.error('Failed to load venues');
    }
  };

  const loadMenu = async (venueId) => {
    try {
      const response = await api.getMenu(venueId);
      setMenuItems(response.data);
    } catch (error) {
      toast.error('Failed to load menu');
    }
  };

  const handleVenueClick = (venue) => {
    setSelectedVenue(venue);
    loadMenu(venue.id);
  };

  const handleAddToCart = async () => {
    try {
      await api.addToCart({
        menu_item_id: selectedItem.id,
        quantity,
        special_instructions: instructions
      });
      toast.success(`Added ${quantity}x ${selectedItem.name} to cart!`);
      onAddToCart();
      setSelectedItem(null);
      setQuantity(1);
      setInstructions('');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const foodCourts = venues.filter(v => v.type === 'food_court');
  const provisionStores = venues.filter(v => v.type === 'provision_store');

  return (
    <div className="space-y-8">
      {/* Food Courts Section */}
      <section>
        <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Outfit', color: '#09090B' }}>
          🍕 Food Courts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodCourts.map((venue) => (
            <Card
              key={venue.id}
              data-testid={`venue-card-${venue.id}`}
              onClick={() => handleVenueClick(venue)}
              className="neo-brutal rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={venue.banner_url}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>{venue.name}</h3>
                <p className="text-sm mb-3" style={{ color: '#52525B' }}>{venue.description}</p>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-current" style={{ color: '#FBBF24' }} />
                  <span className="font-semibold">{venue.rating.toFixed(1)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Provision Stores Section */}
      <section>
        <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Outfit', color: '#09090B' }}>
          🛒 Provision Stores
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {provisionStores.map((venue) => (
            <Card
              key={venue.id}
              data-testid={`venue-card-${venue.id}`}
              onClick={() => handleVenueClick(venue)}
              className="neo-brutal rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={venue.banner_url}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>{venue.name}</h3>
                <p className="text-sm mb-3" style={{ color: '#52525B' }}>{venue.description}</p>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-current" style={{ color: '#FBBF24' }} />
                  <span className="font-semibold">{venue.rating.toFixed(1)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Menu Modal */}
      <Dialog open={selectedVenue !== null} onOpenChange={() => { setSelectedVenue(null); setMenuItems([]); }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Outfit' }}>
              {selectedVenue?.name} Menu
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {menuItems.map((item) => (
              <Card
                key={item.id}
                data-testid={`menu-item-${item.id}`}
                onClick={() => setSelectedItem(item)}
                className="border-2 border-black rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h4 className="font-bold text-lg">{item.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg" style={{ color: '#F97316' }}>₹{item.price}</span>
                    {item.stock !== undefined && (
                      <Badge variant="outline">Stock: {item.stock}</Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Detail Modal */}
      <Dialog open={selectedItem !== null} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Outfit' }}>
              {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-64 object-cover rounded-lg" />
              
              {selectedItem.video_url && (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-gray-500">Video placeholder</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-gray-600">{selectedItem.description}</p>
              </div>

              {selectedItem.ingredients && (
                <div>
                  <h4 className="font-semibold mb-2">Ingredients</h4>
                  <p className="text-sm text-gray-600">{selectedItem.ingredients}</p>
                </div>
              )}

              {selectedItem.nutritional_info && (
                <div>
                  <h4 className="font-semibold mb-2">Nutritional Info</h4>
                  <p className="text-sm text-gray-600">{selectedItem.nutritional_info}</p>
                </div>
              )}

              {selectedItem.health_score && (
                <div>
                  <h4 className="font-semibold mb-2">Health Score</h4>
                  <Badge style={{ backgroundColor: '#10B981', color: 'white' }}>{selectedItem.health_score}/100</Badge>
                </div>
              )}

              {selectedItem.allergens && (
                <div>
                  <h4 className="font-semibold mb-2">Allergens</h4>
                  <p className="text-sm text-red-600">{selectedItem.allergens}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Quantity</h4>
                <div className="flex items-center gap-3">
                  <Button onClick={() => setQuantity(Math.max(1, quantity - 1))} variant="outline">-</Button>
                  <span className="font-bold text-xl">{quantity}</span>
                  <Button onClick={() => setQuantity(quantity + 1)} variant="outline">+</Button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Special Instructions (Optional)</h4>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full border-2 border-black rounded-lg p-3"
                  rows={3}
                  placeholder="e.g., Extra cheese, no onions"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold" style={{ color: '#F97316' }}>₹{(selectedItem.price * quantity).toFixed(2)}</span>
                <Button
                  data-testid="add-to-cart-button"
                  onClick={handleAddToCart}
                  className="rounded-full px-8 py-6"
                  style={{ backgroundColor: '#F97316', color: 'white' }}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};