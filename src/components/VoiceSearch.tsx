

VoiceSearch.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, Sparkles } from 'lucide-react';

export default function VoiceSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  let recognition: any = null;

  useEffect(() => {
    if (isOpen && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-PK';

      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setTranscript(text);
        // You could trigger real search here
        setTimeout(() => onClose(), 1200);
      };

      recognition.start();
      setIsListening(true);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl"
        >
          <button 
            onClick={onClose}
            className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors"
          >
            <X size={32} />
          </button>

          <div className="text-center">
            <motion.div
              animate={{ 
                scale: isListening ? [1, 1.2, 1] : 1,
                boxShadow: isListening ? [
                  "0 0 0px #00D2FF",
                  "0 0 40px #00D2FF",
                  "0 0 0px #00D2FF"
                ] : "none"
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-32 h-32 rounded-full bg-neon-cyan flex items-center justify-center text-black mb-12 mx-auto"
            >
              <Mic size={48} />
            </motion.div>

            <h2 className="text-4xl font-black font-display mb-4">
              {isListening ? "LISTENING..." : "PROCESSING..."}
            </h2>
            
            <div className="flex items-center justify-center gap-2 text-neon-cyan font-mono text-xl">
              <Sparkles size={20} />
              {transcript || "Say something..."}
            </div>

            <p className="mt-12 text-white/30 uppercase tracking-[0.2em] text-xs font-bold">
              Powered by Haiders AI Core
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}