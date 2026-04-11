import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

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

      recog.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition error');
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    } else {
      toast.error('Voice recognition not supported in this browser');
    }
  }, []);

  const processCommand = (text) => {
    const lowerText = text.toLowerCase();
    
    // Extract commands
    if (lowerText.includes('cart') || lowerText.includes('checkout')) {
      onCommand({ type: 'navigate', target: 'cart' });
      toast.success('Opening cart');
    } else if (lowerText.includes('order')) {
      onCommand({ type: 'navigate', target: 'orders' });
      toast.success('Opening orders');
    } else {
      // Try to extract venue names
      const venues = ['dominos', 'punjabi tadka', 'hangouts', 'campus mart'];
      const matchedVenue = venues.find(v => lowerText.includes(v));
      
      if (matchedVenue) {
        onCommand({ type: 'search', query: matchedVenue });
        toast.success(`Searching for ${matchedVenue}`);
      } else {
        onCommand({ type: 'search', query: text });
        toast.info(`Searching for: ${text}`);
      }
    }
    
    setTranscript('');
  };

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
      toast.info('Listening... Speak now!');
    }
  };

  return (
    <div className="fixed bottom-24 right-8 z-50">
      <motion.div
        animate={isListening ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: isListening ? Infinity : 0, duration: 1.5 }}
      >
        <Button
          data-testid="voice-command-btn"
          onClick={toggleListening}
          className="rounded-full w-16 h-16 shadow-lg relative"
          style={{ backgroundColor: isListening ? '#F97316' : '#FBBF24' }}
        >
          {isListening ? (
            <>
              <div className="absolute inset-0 rounded-full pulse-ring" style={{ backgroundColor: '#F97316' }} />
              <MicOff className="w-6 h-6 relative z-10" style={{ color: 'white' }} />
            </>
          ) : (
            <Mic className="w-6 h-6" style={{ color: 'white' }} />
          )}
        </Button>
      </motion.div>
      
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-20 right-0 bg-white border-2 border-black rounded-lg p-3 shadow-lg min-w-[200px]"
        >
          <p className="text-sm font-medium">"{transcript}"</p>
        </motion.div>
      )}
    </div>
  );
};