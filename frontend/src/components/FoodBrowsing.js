import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Star, Clock, Flame, Zap, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);
  return <span className="font-mono font-bold text-sm" style={{ color: '#F97316' }}>{timeLeft}</span>;
};

export const FoodBrowsing = ({ onAddToCart }) => {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [offers, setOffers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [specials, setSpecials] = useState([]);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    loadVenues();
    loadOffers();
    loadTrending();
    loadSpecials();
  }, []);

  const loadVenues = async () => { try { setVenues((await api.getVenues()).data); } catch(e) {} };
  const loadOffers = async () => { try { setOffers((await api.getOffers()).data); } catch(e) {} };
  const loadTrending = async () => { try { setTrending((await api.getTrending()).data); } catch(e) {} };
  const loadSpecials = async () => { try { setSpecials((await api.getSpecials()).data); } catch(e) {} };

  const loadMenu = async (venueId) => {
    try { setMenuItems((await api.getMenu(venueId)).data); } catch(e) { toast.error('Failed to load menu'); }
  };

  const handleVenueClick = (venue) => { setSelectedVenue(venue); loadMenu(venue.id); };

  const handleAddToCart = async () => {
    try {
      await api.addToCart({ menu_item_id: selectedItem.id, quantity, special_instructions: instructions });
      toast.success(`Added ${quantity}x ${selectedItem.name} to cart!`);
      onAddToCart();
      setSelectedItem(null); setQuantity(1); setInstructions(''); setShowVideo(false);
    } catch(e) { toast.error('Failed to add to cart'); }
  };

  const foodCourts = venues.filter(v => v.type === 'food_court');
  const provisionStores = venues.filter(v => v.type === 'provision_store');

  return (
    <div className="space-y-8">
      {/* Today's Offers */}
      {offers.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6" style={{ color: '#F97316' }} />
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Outfit', color: '#09090B' }}>Today's Offers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {offers.map(offer => (
              <Card key={offer.id} data-testid={`offer-${offer.id}`} className="neo-brutal rounded-2xl overflow-hidden" style={{ backgroundColor: '#FEF3C7' }}>
                <img src={offer.image_url} alt={offer.title} className="w-full h-32 object-cover" />
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-1">{offer.title}</h3>
                  <p className="text-xs mb-2" style={{ color: '#52525B' }}>{offer.description}</p>
                  <div className="flex items-center justify-between">
                    {offer.discount_pct > 0 && (
                      <Badge style={{ backgroundColor: '#F97316', color: 'white' }}>{offer.discount_pct}% OFF</Badge>
                    )}
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" /><CountdownTimer expiresAt={offer.expires_at} /></div>
                  </div>
                  {offer.code && <p className="text-xs font-mono mt-2 p-1 rounded text-center" style={{ backgroundColor: '#FFFFFF', border: '1px dashed #F97316' }}>Code: {offer.code}</p>}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Specials For You */}
      {specials.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-6 h-6" style={{ color: '#FBBF24' }} />
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Outfit', color: '#09090B' }}>Specials For You</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {specials.map(item => (
              <Card key={item.id} data-testid={`special-${item.id}`} onClick={() => setSelectedItem(item)} className="neo-brutal rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform shrink-0 w-48" style={{ backgroundColor: '#FFFFFF' }}>
                <img src={item.image_url} alt={item.name} className="w-48 h-32 object-cover" />
                <div className="p-3">
                  <h4 className="font-bold text-sm truncate">{item.name}</h4>
                  <p className="font-bold text-sm mt-1" style={{ color: '#F97316' }}>&#8377;{item.price}</p>
                  {item.original_price && <p className="text-xs line-through text-gray-400">&#8377;{item.original_price}</p>}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Trending Now */}
      {trending.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-6 h-6" style={{ color: '#EF4444' }} />
            <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Outfit', color: '#09090B' }}>Trending Now</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {trending.map((item, idx) => (
              <Card key={item.id || idx} data-testid={`trending-${idx}`} onClick={() => item.id && setSelectedItem(item)} className="neo-brutal rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition-transform shrink-0 w-48" style={{ backgroundColor: '#FFFFFF' }}>
                <div className="relative">
                  <img src={item.image_url} alt={item.name} className="w-48 h-32 object-cover" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#EF4444', color: 'white' }}>#{idx + 1}</div>
                  {item.is_combo && <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#10B981', color: 'white' }}>COMBO</div>}
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm truncate">{item.name}</h4>
                  <p className="font-bold text-sm mt-1" style={{ color: '#F97316' }}>&#8377;{item.price}</p>
                  {item.count && <p className="text-xs text-gray-500">{item.count} ordered</p>}
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Food Courts */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6" style={{ fontFamily: 'Outfit', color: '#09090B' }}>Food Courts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {foodCourts.map(venue => (
            <Card key={venue.id} data-testid={`venue-card-${venue.id}`} onClick={() => handleVenueClick(venue)} className="neo-brutal rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="aspect-video overflow-hidden"><img src={venue.banner_url} alt={venue.name} className="w-full h-full object-cover" /></div>
              <div className="p-4">
                <h3 className="text-lg font-bold" style={{ fontFamily: 'Outfit' }}>{venue.name}</h3>
                <p className="text-sm mb-2" style={{ color: '#52525B' }}>{venue.description}</p>
                <div className="flex items-center gap-2"><Star className="w-4 h-4 fill-current" style={{ color: '#FBBF24' }} /><span className="font-semibold text-sm">{venue.rating.toFixed(1)}</span></div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Provision Stores */}
      <section>
        <h2 className="text-2xl sm:text-3xl font-bold mb-6" style={{ fontFamily: 'Outfit', color: '#09090B' }}>Provision Stores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {provisionStores.map(venue => (
            <Card key={venue.id} data-testid={`venue-card-${venue.id}`} onClick={() => handleVenueClick(venue)} className="neo-brutal rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="aspect-video overflow-hidden"><img src={venue.banner_url} alt={venue.name} className="w-full h-full object-cover" /></div>
              <div className="p-4">
                <h3 className="text-lg font-bold" style={{ fontFamily: 'Outfit' }}>{venue.name}</h3>
                <p className="text-sm mb-2" style={{ color: '#52525B' }}>{venue.description}</p>
                <div className="flex items-center gap-2"><Star className="w-4 h-4 fill-current" style={{ color: '#FBBF24' }} /><span className="font-semibold text-sm">{venue.rating.toFixed(1)}</span></div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Menu Modal */}
      <Dialog open={selectedVenue !== null && !selectedItem} onOpenChange={() => { setSelectedVenue(null); setMenuItems([]); }}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Outfit' }}>{selectedVenue?.name} Menu</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {menuItems.map(item => (
              <Card key={item.id} data-testid={`menu-item-${item.id}`} onClick={() => setSelectedItem(item)} className="border-2 border-black rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover" />
                  {item.is_combo && <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#10B981', color: 'white' }}>COMBO DEAL</div>}
                  {item.video_url && <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}><Play className="w-4 h-4 text-white" /></div>}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg">{item.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-lg" style={{ color: '#F97316' }}>&#8377;{item.price}</span>
                      {item.original_price && <span className="text-sm line-through text-gray-400 ml-2">&#8377;{item.original_price}</span>}
                    </div>
                    {item.stock !== undefined && <Badge variant="outline">Stock: {item.stock}</Badge>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Detail Modal with Video Slider */}
      <Dialog open={selectedItem !== null} onOpenChange={() => { setSelectedItem(null); setShowVideo(false); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-2xl font-bold" style={{ fontFamily: 'Outfit' }}>{selectedItem?.name}</DialogTitle></DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              {/* Image / Video Slider */}
              <div className="relative rounded-lg overflow-hidden">
                {showVideo && selectedItem.video_url ? (
                  <div className="aspect-video">
                    <iframe src={selectedItem.video_url} title="Food video" className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" />
                  </div>
                ) : (
                  <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-64 object-cover" />
                )}
                {selectedItem.video_url && (
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button onClick={() => setShowVideo(false)} className={`w-3 h-3 rounded-full ${!showVideo ? 'bg-orange-500' : 'bg-white/50'}`} />
                    <button onClick={() => setShowVideo(true)} className={`w-3 h-3 rounded-full ${showVideo ? 'bg-orange-500' : 'bg-white/50'}`} />
                  </div>
                )}
                {selectedItem.video_url && !showVideo && (
                  <button onClick={() => setShowVideo(true)} className="absolute bottom-3 left-3 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                    <Play className="w-3 h-3" /> Watch Video
                  </button>
                )}
                {selectedItem.is_combo && <Badge className="absolute top-3 left-3" style={{ backgroundColor: '#10B981', color: 'white' }}>COMBO DEAL - Save &#8377;{((selectedItem.original_price || 0) - selectedItem.price).toFixed(0)}</Badge>}
              </div>

              <p className="text-sm text-gray-600">{selectedItem.description}</p>
              {selectedItem.ingredients && <div><h4 className="font-semibold text-sm mb-1">Ingredients</h4><p className="text-sm text-gray-600">{selectedItem.ingredients}</p></div>}

              <div className="grid grid-cols-3 gap-3">
                {selectedItem.health_score && (
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F0FDF4' }}>
                    <p className="text-xs text-gray-500">Health</p>
                    <p className="font-bold text-lg" style={{ color: '#10B981' }}>{selectedItem.health_score}/100</p>
                  </div>
                )}
                {selectedItem.nutritional_info && (
                  <div className="col-span-2 p-3 rounded-lg" style={{ backgroundColor: '#EFF6FF' }}>
                    <p className="text-xs text-gray-500">Nutrition</p>
                    <p className="text-sm font-medium">{selectedItem.nutritional_info}</p>
                  </div>
                )}
              </div>

              {selectedItem.allergens && <p className="text-xs text-red-500 font-medium">Allergens: {selectedItem.allergens}</p>}

              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm">Qty:</span>
                <Button size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} variant="outline" className="w-8 h-8 p-0">-</Button>
                <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                <Button size="sm" onClick={() => setQuantity(quantity + 1)} variant="outline" className="w-8 h-8 p-0">+</Button>
              </div>

              <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} className="w-full border-2 border-black rounded-lg p-3 text-sm" rows={2} placeholder="Special instructions (optional)" />

              <div className="flex justify-between items-center pt-2">
                <div>
                  <span className="text-2xl font-bold" style={{ color: '#F97316' }}>&#8377;{(selectedItem.price * quantity).toFixed(0)}</span>
                  {selectedItem.original_price && <span className="text-sm line-through text-gray-400 ml-2">&#8377;{(selectedItem.original_price * quantity).toFixed(0)}</span>}
                </div>
                <Button data-testid="add-to-cart-button" onClick={handleAddToCart} className="rounded-full px-8 py-5 font-bold" style={{ backgroundColor: '#F97316', color: 'white' }}>Add to Cart</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
