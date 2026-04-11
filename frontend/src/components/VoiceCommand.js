import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { api } from '../utils/api';

export const VoiceCommand = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        if (event.results[current].isFinal) {
          processCommand(transcriptText);
        }
      };

      recog.onerror = () => { setIsListening(false); };
      recog.onend = () => { setIsListening(false); };
      setRecognition(recog);
    }
  }, []);

  const processCommand = async (text) => {
    const lower = text.toLowerCase();

    // Navigate commands
    if (lower.includes('cart') || lower.includes('checkout')) {
      onCommand({ type: 'navigate', target: 'cart' });
      toast.success('Opening cart');
      setTranscript('');
      return;
    }
    if (lower.includes('order') && (lower.includes('my') || lower.includes('track'))) {
      onCommand({ type: 'navigate', target: 'orders' });
      toast.success('Opening orders');
      setTranscript('');
      return;
    }
    if (lower.includes('refer') || lower.includes('referral')) {
      onCommand({ type: 'navigate', target: 'referral' });
      toast.success('Opening referrals');
      setTranscript('');
      return;
    }

    // Smart add to cart: "add 2 margherita pizza"
    const addMatch = lower.match(/add\s+(\d+)?\s*(.+?)(?:\s+to\s+(?:my\s+)?cart)?$/);
    if (addMatch || lower.includes('add')) {
      const qty = addMatch ? parseInt(addMatch[1]) || 1 : 1;
      const itemName = addMatch ? addMatch[2].trim() : lower.replace('add', '').replace('to cart', '').replace('to my cart', '').trim();

      if (itemName) {
        try {
          const res = await api.searchItems(itemName);
          const items = res.data;
          if (items.length > 0) {
            const item = items[0];
            await api.addToCart({ menu_item_id: item.id, quantity: qty, special_instructions: '' });
            toast.success(`Added ${qty}x ${item.name} to cart!`);
            onCommand({ type: 'cart_updated' });
          } else {
            toast.info(`No items found for "${itemName}"`);
          }
        } catch(e) {
          toast.error('Failed to add item');
        }
        setTranscript('');
        return;
      }
    }

    // Search fallback
    onCommand({ type: 'search', query: text });
    toast.info(`Searching: ${text}`);
    setTranscript('');
  };

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
      toast.info('Listening... Try "Add 2 Margherita Pizza to cart"');
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <motion.div animate={isListening ? { scale: [1, 1.1, 1] } : {}} transition={{ repeat: isListening ? Infinity : 0, duration: 1.5 }}>
        <Button
          data-testid="voice-command-btn"
          onClick={toggleListening}
          className="rounded-full w-14 h-14 shadow-xl relative"
          style={{ backgroundColor: isListening ? '#EF4444' : '#F97316', border: '2px solid #000' }}
        >
          {isListening ? (
            <>
              <div className="absolute inset-0 rounded-full pulse-ring" style={{ backgroundColor: '#EF4444' }} />
              <MicOff className="w-6 h-6 relative z-10 text-white" />
            </>
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </Button>
      </motion.div>

      {(transcript || isListening) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-16 right-0 p-3 rounded-lg shadow-lg min-w-[220px] max-w-[280px]"
          style={{ backgroundColor: '#FFFFFF', border: '2px solid #000', boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)' }}>
          {isListening && !transcript && <p className="text-sm text-gray-500 animate-pulse">Listening...</p>}
          {transcript && <p className="text-sm font-medium">"{transcript}"</p>}
        </motion.div>
      )}
    </div>
  );
};
