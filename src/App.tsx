


// oooooooo?


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

// Global animation preset
const SOFT_SPRING = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.8
};

const BOUNCY_SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 15
};

// ==================== UTILS ====================
const encodeData = (data: { senderName: string; recipientName: string }): string => {
  const jsonStr = JSON.stringify(data);
  // URL-safe base64 encoding
  return btoa(encodeURIComponent(jsonStr))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const decodeData = (encoded: string): { senderName: string; recipientName: string } | null => {
  try {
    // Add padding back if needed
    let padded = encoded;
    while (padded.length % 4) {
      padded += '=';
    }
    
    // Convert back from URL-safe
    padded = padded.replace(/-/g, '+').replace(/_/g, '/');
    
    const jsonStr = decodeURIComponent(atob(padded));
    const data = JSON.parse(jsonStr);
    
    if (typeof data.senderName !== 'string' || typeof data.recipientName !== 'string') {
      return null;
    }
    
    return {
      senderName: data.senderName.trim().substring(0, 20),
      recipientName: data.recipientName.trim().substring(0, 20)
    };
  } catch {
    return null;
  }
};

// Generate a unique ID for sharing
const generateShareId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// ==================== COMPONENTS ====================
// Character components
const SenderCharacter: React.FC<{ 
  emotion?: 'normal' | 'happy' | 'nervous' | 'excited';
  isTalking?: boolean;
  gender?: 'boy' | 'girl';
  className?: string;
}> = ({ emotion = 'normal', isTalking = false, gender = 'boy', className = '' }) => {
  const emojis = {
    normal: '😊',
    happy: '😄',
    nervous: '😅',
    excited: '🤩'
  };

  const colors = gender === 'boy' ? {
    body: '#4A90E2',
    hair: '#8B4513'
  } : {
    body: '#FF6B8B',
    hair: '#FF69B4'
  };

  return (
    <motion.div 
      className={`relative ${className}`}
      animate={{
        y: isTalking ? [0, -5, 0] : 0,
        scale: isTalking ? [1, 1.02, 1] : 1
      }}
      transition={{
        duration: 0.6,
        repeat: isTalking ? Infinity : 0,
        repeatType: "reverse"
      }}
    >
      <div className="relative">
        {/* Body */}
        <div className="w-24 h-32 rounded-full" style={{ backgroundColor: colors.body }}>
          {/* Head */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-16 rounded-full" style={{ backgroundColor: '#FFD1A9' }}>
              {/* Face */}
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                {emojis[emotion]}
              </div>
              {/* Hair */}
              <div 
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-20 h-8 rounded-full"
                style={{ backgroundColor: colors.hair }}
              />
              {/* Gender-specific accessory */}
              {gender === 'girl' && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-lg">
                  🌸
                </div>
              )}
            </div>
          </div>
          
          {/* Arms */}
          <div className="absolute top-8 -left-4 w-8 h-16 rounded-full" style={{ backgroundColor: colors.body }} />
          <div className="absolute top-8 -right-4 w-8 h-16 rounded-full" style={{ backgroundColor: colors.body }} />
          
          {/* Heart in hand */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-4 -right-8 text-2xl"
          >
            ❤️
          </motion.div>
        </div>
        
        {/* Speech bubble when talking */}
        <AnimatePresence>
          {isTalking && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-20 left-1/2 transform -translate-x-1/2"
            >
              <div className="relative">
                <div className="bg-white rounded-2xl p-3 shadow-lg">
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: gender === 'boy' ? '#4A90E2' : '#FF6B8B' }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: gender === 'boy' ? '#4A90E2' : '#FF6B8B' }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: gender === 'boy' ? '#4A90E2' : '#FF6B8B' }}
                    />
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const RecipientCharacter: React.FC<{ 
  emotion?: 'normal' | 'happy' | 'surprised' | 'blushing';
  isTalking?: boolean;
  hasRing?: boolean;
  gender?: 'boy' | 'girl';
  className?: string;
}> = ({ emotion = 'normal', isTalking = false, hasRing = false, gender = 'girl', className = '' }) => {
  const emojis = {
    normal: '😊',
    happy: '🥰',
    surprised: '😲',
    blushing: '😳'
  };

  const colors = gender === 'boy' ? {
    body: '#4A90E2',
    hair: '#8B4513'
  } : {
    body: '#FF6B8B',
    hair: '#FF69B4'
  };

  return (
    <motion.div 
      className={`relative ${className}`}
      animate={{
        y: isTalking ? [0, -5, 0] : 0,
        scale: isTalking ? [1, 1.02, 1] : 1
      }}
      transition={{
        duration: 0.6,
        repeat: isTalking ? Infinity : 0,
        repeatType: "reverse"
      }}
    >
      <div className="relative">
        {/* Body */}
        <div className="w-24 h-32 rounded-full" style={{ backgroundColor: colors.body }}>
          {/* Head */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-16 rounded-full relative" style={{ backgroundColor: '#FFD1A9' }}>
              {/* Face */}
              <div className="absolute inset-0 flex items-center justify-center text-2xl">
                {emojis[emotion]}
              </div>
              {/* Hair */}
              <div 
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-20 h-10 rounded-full"
                style={{ backgroundColor: colors.hair }}
              />
              {/* Gender-specific accessory */}
              {gender === 'girl' && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xl">
                  🌸
                </div>
              )}
            </div>
          </div>
          
          {/* Arms */}
          <div className="absolute top-8 -left-4 w-8 h-16 rounded-full" style={{ backgroundColor: colors.body }} />
          <div className="absolute top-8 -right-4 w-8 h-16 rounded-full" style={{ backgroundColor: colors.body }} />
          
          {/* Ring on finger */}
          <AnimatePresence>
            {hasRing && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.8 }}
                className="absolute top-12 -right-10"
              >
                <div className="relative">
                  {/* Finger */}
                  <div className="w-4 h-12 rounded-full" style={{ backgroundColor: '#FFD1A9' }} />
                  {/* Ring */}
                  <motion.div
                    initial={{ y: -20, scale: 0 }}
                    animate={{ y: 0, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                    className="absolute top-1 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="text-3xl">💍</div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Speech bubble when talking */}
        <AnimatePresence>
          {isTalking && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-20 left-1/2 transform -translate-x-1/2"
            >
              <div className="relative">
                <div className="bg-white rounded-2xl p-3 shadow-lg">
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.body }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.body }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: colors.body }}
                    />
                  </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Ring Box Component
const RingBox: React.FC<{ 
  isOpen: boolean; 
  onOpen: () => void;
  onRingSelect: () => void;
  ringPosition: { x: number; y: number } | null;
}> = ({ isOpen, onOpen, onRingSelect, ringPosition }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative">
      {/* Box container */}
      <motion.div
        animate={isOpen ? {
          scale: [1, 1.1, 1],
          rotateY: 360
        } : {}}
        transition={isOpen ? { duration: 1 } : {}}
        className="relative cursor-pointer"
        onClick={!isOpen ? onOpen : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Box */}
        <div className="relative">
          {/* Box base */}
          <motion.div
            animate={isOpen ? {
              rotateX: -120,
              y: -50
            } : {}}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            className="w-48 h-32 rounded-2xl relative"
            style={{ 
              backgroundColor: '#D4AF37',
              background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
              boxShadow: '0 20px 40px rgba(212, 175, 55, 0.4)'
            }}
          >
            {/* Box lid */}
            <motion.div
              animate={isOpen ? {
                rotateX: -120,
                y: -80
              } : {}}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              className="absolute inset-0 rounded-2xl"
              style={{ 
                backgroundColor: '#FFD700',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFF8DC 100%)',
                transformOrigin: 'bottom',
                boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.5)'
              }}
            >
              {/* Velvet inside */}
              <div className="absolute inset-2 rounded-xl" style={{ backgroundColor: '#8B0000' }} />
              
              {/* Decorative ribbon */}
              <div className="absolute top-1/2 left-0 right-0 h-2" style={{ backgroundColor: '#FF6B8B' }} />
              <div className="absolute left-1/2 top-0 bottom-0 w-2 transform -translate-x-1/2" style={{ backgroundColor: '#FF6B8B' }} />
              
              {/* Lock */}
              {!isOpen && (
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-3xl"
                >
                  🔒
                </motion.div>
              )}
            </motion.div>
            
            {/* Ring inside box */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="text-5xl cursor-pointer"
                    onClick={onRingSelect}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    💍
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        
        {/* Sparkles around box */}
        <AnimatePresence>
          {isHovered && !isOpen && (
            <>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute text-xl"
                  style={{
                    left: `${Math.cos((i * Math.PI) / 4) * 80 + 100}px`,
                    top: `${Math.sin((i * Math.PI) / 4) * 60 + 70}px`,
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Ring flying to finger */}
      <AnimatePresence>
        {ringPosition && (
          <motion.div
            initial={{
              x: 0,
              y: 0,
              scale: 1,
              rotate: 0
            }}
            animate={{
              x: ringPosition.x,
              y: ringPosition.y,
              scale: [1, 1.5, 1],
              rotate: 360
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-0 text-5xl"
            onAnimationComplete={() => {}}
          >
            💍
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Instruction text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-6"
      >
        {!isOpen ? (
          <p className="text-lg" style={{ color: '#FF4D6D' }}>
            👆 Click to open the ring box!
          </p>
        ) : (
          <p className="text-lg" style={{ color: '#FF4D6D' }}>
            💍 Click the ring to put it on their finger!
          </p>
        )}
      </motion.div>
    </div>
  );
};

// Moving "No" button
const MovingNoButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, BOUNCY_SPRING);
  const springY = useSpring(y, BOUNCY_SPRING);
  
  const moveAway = useCallback(() => {
    const maxX = window.innerWidth - 200;
    const maxY = window.innerHeight - 80;
    const newX = Math.random() * maxX - maxX / 2;
    const newY = Math.random() * maxY - maxY / 2;
    
    x.set(newX);
    y.set(newY);
  }, [x, y]);
  
  useEffect(() => {
    moveAway();
    const interval = setInterval(moveAway, 2000);
    return () => clearInterval(interval);
  }, [moveAway]);
  
  return (
    <motion.button
      style={{ 
        x: springX, 
        y: springY,
        backgroundColor: '#FF8FA3'
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onMouseEnter={moveAway}
      onTouchStart={moveAway}
      onClick={onClick}
      className="fixed py-4 px-8 rounded-2xl font-medium text-lg text-white shadow-lg z-20"
    >
      No, I'm shy 🙈
    </motion.button>
  );
};

// Share Link Component
const ShareLinkComponent: React.FC<{ 
  link: string;
  senderName: string;
  recipientName: string;
}> = ({ link, senderName, recipientName }) => {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setShowTooltip(true);
      
      // Hide tooltip after 2 seconds
      setTimeout(() => {
        setShowTooltip(false);
        setTimeout(() => setCopied(false), 300);
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      setShowTooltip(true);
      
      setTimeout(() => {
        setShowTooltip(false);
        setTimeout(() => setCopied(false), 300);
      }, 2000);
    }
  };
  
  const shareViaApp = () => {
    if (navigator.share) {
      navigator.share({
        title: `💌 Valentine Proposal from ${senderName}`,
        text: `Hey ${recipientName}! ${senderName} has a special Valentine's message for you! 💖`,
        url: link
      }).catch(console.error);
    } else {
      copyToClipboard();
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-xl max-w-[380px] w-full mx-auto"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2" style={{ color: '#FF4D6D' }}>
          Your Proposal Link is Ready! 🎉
        </h3>
        <p className="text-sm opacity-70" style={{ color: '#2B2B2B' }}>
          Share this link with {recipientName}
        </p>
      </div>
      
      {/* Link display */}
      <div className="relative mb-6">
        <div className="flex items-center bg-gray-50 rounded-xl p-4 mb-2">
          <div className="flex-1 overflow-hidden">
            <p className="text-sm truncate" style={{ color: '#2B2B2B' }}>
              {link}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={copyToClipboard}
            className="ml-2 p-2 rounded-lg"
            style={{ backgroundColor: '#FFD6E0' }}
          >
            {copied ? '✅' : '📋'}
          </motion.button>
        </div>
        
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-10 left-0 right-0 text-center"
            >
              <div className="inline-block bg-green-500 text-white text-xs py-1 px-3 rounded-full">
                ✓ Link copied to clipboard!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Share buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={copyToClipboard}
          className="py-3 rounded-xl font-medium flex items-center justify-center gap-2"
          style={{ backgroundColor: '#FFD6E0', color: '#FF4D6D' }}
        >
          <span>📋</span>
          {copied ? 'Copied!' : 'Copy Link'}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={shareViaApp}
          className="py-3 rounded-xl font-medium flex items-center justify-center gap-2 text-white"
          style={{ backgroundColor: '#FF4D6D' }}
        >
          <span>📤</span>
          Share
        </motion.button>
      </div>
      
      {/* Instructions */}
      <div className="text-center">
        <p className="text-xs opacity-50" style={{ color: '#2B2B2B' }}>
          Send this link to {recipientName} via WhatsApp, Instagram, SMS, or any app!
        </p>
      </div>
    </motion.div>
  );
};

// ==================== PAGES ====================
const EntryPage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundColor: '#FFF5F7' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated hearts background */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            y: '100vh', 
            x: `${Math.random() * 100}vw`,
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: '-100vh',
            x: `${Math.random() * 100}vw`,
            rotate: 360,
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "linear"
          }}
          className="absolute text-2xl pointer-events-none"
          style={{ color: '#FF8FA3' }}
        >
          {['💖', '💕', '💘', '💝'][Math.floor(Math.random() * 4)]}
        </motion.div>
      ))}
      
      <div className="relative z-10 max-w-[380px] w-full text-center">
        {/* Characters introduction */}
        <div className="flex justify-around items-end mb-12">
          <SenderCharacter emotion="nervous" isTalking={true} gender="boy" />
          <div className="text-4xl mb-8">💌</div>
          <RecipientCharacter emotion="blushing" gender="girl" />
        </div>
        
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mb-6"
          style={{ color: '#FF4D6D' }}
        >
      Create Your Valentine Proposal 💖
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg mb-8 leading-relaxed"
          style={{ color: '#2B2B2B' }}
        >
          Create a magical Valentine's proposal and share it with that special someone!
        </motion.p>
        
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, type: "spring" }}
          whileHover={{ 
            scale: 1.05,
            rotate: [0, 2, -2, 0],
            transition: { duration: 0.5 }
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/create')}
          className="py-4 px-8 rounded-2xl font-bold text-lg text-white shadow-xl relative overflow-hidden"
          style={{ 
            background: 'linear-gradient(135deg, #FF4D6D 0%, #FF8FA3 100%)',
            boxShadow: '0 10px 30px rgba(255, 77, 109, 0.3)'
          }}
        >
          <motion.span
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
          <span className="relative z-10">
            Create Proposal Link ✨
          </span>
        </motion.button>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-sm mt-6 opacity-60"
          style={{ color: '#2B2B2B' }}
        >
          Works for everyone! 👫 Boy to Girl, Girl to Boy, and everyone in between! 💕
        </motion.p>
      </div>
    </motion.div>
  );
};

const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderGender, setSenderGender] = useState<'boy' | 'girl'>('boy');
  const [recipientGender, setRecipientGender] = useState<'girl' | 'boy'>('girl');
  const [showShareLink, setShowShareLink] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkId, setLinkId] = useState('');
  
  const handleCreateProposal = () => {
    if (!senderName.trim() || !recipientName.trim()) return;
    
    const data = {
      senderName: senderName.trim(),
      recipientName: recipientName.trim(),
      senderGender,
      recipientGender
    };
    
    const encoded = encodeData(data);
    const id = generateShareId();
    const link = `${window.location.origin}/proposal/${id}?d=${encoded}`;
    
    setGeneratedLink(link);
    setLinkId(id);
    
    // Celebration animation
    document.body.style.overflow = 'hidden';
    
    for (let i = 0; i < 30; i++) {
      const heart = document.createElement('div');
      heart.textContent = '💖';
      heart.style.position = 'fixed';
      heart.style.left = `${Math.random() * 100}vw`;
      heart.style.top = `${Math.random() * 100}vh`;
      heart.style.fontSize = '2rem';
      heart.style.zIndex = '9999';
      document.body.appendChild(heart);
      
      const start = performance.now();
      const duration = 1500;
      
      const step = (timestamp: number) => {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        
        const y = progress * -100;
        const x = (Math.random() * 100 - 50) * progress;
        const rotate = 720 * progress;
        const opacity = 1 - progress;
        
        heart.style.transform = `translate(${x}vw, ${y}vh) rotate(${rotate}deg)`;
        heart.style.opacity = String(opacity);
        
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          heart.remove();
        }
      };
      
      requestAnimationFrame(step);
    }
    
    setTimeout(() => {
      document.body.style.overflow = 'auto';
      setShowShareLink(true);
    }, 1000);
  };
  
  if (showShareLink) {
    return (
      <motion.div 
        className="min-h-screen flex flex-col items-center justify-center p-6 relative"
        style={{ backgroundColor: '#FFF5F7' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Characters celebrating */}
        <div className="flex justify-center gap-12 mb-8">
          <SenderCharacter emotion="excited" gender={senderGender} />
          <RecipientCharacter emotion="happy" gender={recipientGender} />
        </div>
        
        <ShareLinkComponent 
          link={generatedLink}
          senderName={senderName}
          recipientName={recipientName}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowShareLink(false);
              setSenderName('');
              setRecipientName('');
            }}
            className="py-3 px-6 rounded-full font-medium"
            style={{ 
              backgroundColor: '#FFD6E0',
              color: '#FF4D6D'
            }}
          >
            Create Another Proposal ✨
          </motion.button>
          
          <p className="text-xs mt-4 opacity-50" style={{ color: '#2B2B2B' }}>
            Once {recipientName} opens the link, they'll see your special proposal!
          </p>
        </motion.div>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center p-6 relative"
      style={{ backgroundColor: '#FFF5F7' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="max-w-[380px] w-full relative z-10">
        <motion.button
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8 py-2 px-4 rounded-full"
          style={{ 
            backgroundColor: '#FFD6E0',
            color: '#FF4D6D'
          }}
        >
          <motion.span
            animate={{ x: [-3, 0, -3] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ←
          </motion.span>
          Back
        </motion.button>
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SOFT_SPRING}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#FF4D6D' }}>
            Create Your Proposal 💌
          </h2>
          <p className="text-sm opacity-70" style={{ color: '#2B2B2B' }}>
            Fill in the details and create a shareable link
          </p>
        </motion.div>
        
        <div className="space-y-6 mb-8">
          {/* Sender Info */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#FF4D6D' }}>
              About You (The Sender)
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm mb-2 font-medium" style={{ color: '#FF4D6D' }}>
                Your Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value.substring(0, 20))}
                className="w-full p-3 rounded-xl text-base border-2"
                style={{
                  backgroundColor: '#FFF5F7',
                  borderColor: '#FFD6E0',
                  color: '#2B2B2B'
                }}
                placeholder="Enter your name"
                maxLength={20}
              />
            </div>
            
            <div>
              <label className="block text-sm mb-2 font-medium" style={{ color: '#FF4D6D' }}>
                Your Gender
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSenderGender('boy')}
                  className={`flex-1 py-2 rounded-lg transition-all ${senderGender === 'boy' ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-100'}`}
                >
                  👦 Boy
                </button>
                <button
                  onClick={() => setSenderGender('girl')}
                  className={`flex-1 py-2 rounded-lg transition-all ${senderGender === 'girl' ? 'bg-pink-100 border-2 border-pink-300' : 'bg-gray-100'}`}
                >
                  👧 Girl
                </button>
              </div>
            </div>
          </div>
          
          {/* Recipient Info */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#FF4D6D' }}>
              About Them (The Recipient)
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm mb-2 font-medium" style={{ color: '#FF4D6D' }}>
                Their Name
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value.substring(0, 20))}
                className="w-full p-3 rounded-xl text-base border-2"
                style={{
                  backgroundColor: '#FFF5F7',
                  borderColor: '#FFD6E0',
                  color: '#2B2B2B'
                }}
                placeholder="Enter their name"
                maxLength={20}
              />
            </div>
            
            <div>
              <label className="block text-sm mb-2 font-medium" style={{ color: '#FF4D6D' }}>
                Their Gender
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setRecipientGender('boy')}
                  className={`flex-1 py-2 rounded-lg transition-all ${recipientGender === 'boy' ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-100'}`}
                >
                  👦 Boy
                </button>
                <button
                  onClick={() => setRecipientGender('girl')}
                  className={`flex-1 py-2 rounded-lg transition-all ${recipientGender === 'girl' ? 'bg-pink-100 border-2 border-pink-300' : 'bg-gray-100'}`}
                >
                  👧 Girl
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateProposal}
          disabled={!senderName.trim() || !recipientName.trim()}
          className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            background: 'linear-gradient(135deg, #FF4D6D 0%, #FF8FA3 100%)',
            boxShadow: '0 10px 30px rgba(255, 77, 109, 0.3)'
          }}
        >
          <motion.span
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
          <span className="relative z-10">
            Generate Shareable Link ✨
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

const ProposalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const encodedData = searchParams.get('d');
  const [proposalData, setProposalData] = useState<{ 
    senderName: string; 
    recipientName: string;
    senderGender?: 'boy' | 'girl';
    recipientGender?: 'boy' | 'girl';
  } | null>(null);
  const [stage, setStage] = useState<'intro' | 'message' | 'question' | 'ring' | 'result' | 'end'>('intro');
  const [isNoButtonFloating, setIsNoButtonFloating] = useState(false);
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [isRingFlying, setIsRingFlying] = useState(false);
  const [ringPosition, setRingPosition] = useState<{ x: number; y: number } | null>(null);
  const [recipientHasRing, setRecipientHasRing] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  
  const introMessages = [
    `Hey ${proposalData?.recipientName}...`,
    `This is ${proposalData?.senderName}...`,
    "I've been wanting to tell you something...",
    "Every moment with you feels special ✨",
    "You make my heart smile every day 💓",
    "So I gathered all my courage...",
    "To ask you something important 💖"
  ];
  
  useEffect(() => {
    if (encodedData) {
      const data = decodeData(encodedData);
      setProposalData(data || {
        senderName: 'Someone',
        recipientName: 'You',
        senderGender: 'boy',
        recipientGender: 'girl'
      });
    }
  }, [encodedData]);
  
  useEffect(() => {
    if (proposalData) {
      setMessages([
        `Hey ${proposalData.recipientName}...`,
        `This is ${proposalData.senderName}...`,
        "I've been wanting to tell you something...",
        "Every moment with you feels special ✨",
        "You make my heart smile every day 💓",
        "So I gathered all my courage...",
        "To ask you something important 💖"
      ]);
      
      // Auto-advance through intro messages
      const timer = setTimeout(() => {
        if (currentMessageIndex < messages.length - 1) {
          setCurrentMessageIndex(prev => prev + 1);
        } else if (stage === 'intro') {
          setStage('question');
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [proposalData, currentMessageIndex, messages.length, stage]);
  
  const handleYes = () => {
    setStage('ring');
  };
  
  const handleNo = () => {
    setIsNoButtonFloating(true);
  };
  
  const handleOpenBox = () => {
    setIsBoxOpen(true);
  };
  
  const handleRingSelect = () => {
    setIsRingFlying(true);
    const targetX = 100;
    const targetY = -100;
    setRingPosition({ x: targetX, y: targetY });
    
    setTimeout(() => {
      setRecipientHasRing(true);
      setIsRingFlying(false);
      setRingPosition(null);
      
      setTimeout(() => {
        setStage('result');
      }, 1000);
    }, 1500);
  };
  
  if (!proposalData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#FFF5F7' }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl mb-4"
          >
            💌
          </motion.div>
          <p className="text-lg mb-4" style={{ color: '#2B2B2B' }}>
            Loading your special message... ✨
          </p>
          <p className="text-sm opacity-70" style={{ color: '#2B2B2B' }}>
            Someone has a Valentine's surprise for you!
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-6 relative overflow-hidden" style={{ backgroundColor: '#FFF5F7' }}>
      {/* Floating hearts background */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            y: '100vh', 
            x: `${Math.random() * 100}vw`,
            rotate: 0
          }}
          animate={{ 
            y: '-100vh',
            rotate: 360
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "linear"
          }}
          className="absolute text-xl pointer-events-none opacity-20"
          style={{ color: '#FF8FA3' }}
        >
          ❤️
        </motion.div>
      ))}
      
      {/* Characters */}
      <div className="flex justify-around items-end mb-8">
        <SenderCharacter 
          emotion={stage === 'result' ? 'excited' : stage === 'ring' ? 'happy' : 'nervous'}
          isTalking={stage === 'intro'}
          gender={proposalData.senderGender || 'boy'}
        />
        <RecipientCharacter 
          emotion={stage === 'result' ? 'blushing' : stage === 'ring' ? 'surprised' : 'normal'}
          hasRing={recipientHasRing}
          gender={proposalData.recipientGender || 'girl'}
        />
      </div>
      
      {/* Content Area */}
      <div className="max-w-[380px] mx-auto">
        {/* Intro Messages */}
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="min-h-[120px] flex items-center justify-center">
              <motion.div
                key={currentMessageIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <p className="text-xl mb-4" style={{ color: '#2B2B2B' }}>
                  {messages[currentMessageIndex]}
                </p>
                <div className="flex justify-center gap-2">
                  {messages.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full ${idx <= currentMessageIndex ? 'bg-pink-400' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {/* Proposal Question */}
        {stage === 'question' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-center"
          >
            <motion.h2
              animate={{ 
                textShadow: [
                  '0 0 0px rgba(255,77,109,0)',
                  '0 0 30px rgba(255,77,109,0.5)',
                  '0 0 0px rgba(255,77,109,0)'
                ]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="text-2xl font-bold mb-8"
              style={{ color: '#FF4D6D' }}
            >
              Will you be my Valentine? 💖
            </motion.h2>
            
            <div className="space-y-4">
              <motion.button
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleYes}
                className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white"
                style={{ 
                  background: 'linear-gradient(135deg, #FF4D6D 0%, #FF8FA3 100%)',
                  boxShadow: '0 10px 30px rgba(255, 77, 109, 0.3)'
                }}
              >
                Yes! Absolutely! 🥹💖
              </motion.button>
              
              {!isNoButtonFloating ? (
                <motion.button
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNo}
                  className="w-full py-4 px-6 rounded-2xl font-bold text-lg text-white"
                  style={{ backgroundColor: '#FF8FA3' }}
                >
                  No, I'm shy 🙈
                </motion.button>
              ) : (
                <MovingNoButton onClick={handleNo} />
              )}
            </div>
          </motion.div>
        )}
        
        {/* Ring Box Stage */}
        {stage === 'ring' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#FF4D6D' }}>
              You said YES! 🎉
            </h2>
            <p className="text-lg mb-8" style={{ color: '#2B2B2B' }}>
              {proposalData.senderName} has a special gift for you...
            </p>
            
            <RingBox 
              isOpen={isBoxOpen}
              onOpen={handleOpenBox}
              onRingSelect={handleRingSelect}
              ringPosition={ringPosition}
            />
            
            {recipientHasRing && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-8"
              >
                <p className="text-xl font-bold" style={{ color: '#FF4D6D' }}>
                  💖 The ring looks perfect on you! 💖
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
        
        {/* Result Stage */}
        {stage === 'result' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-center"
          >
            {/* Celebration confetti */}
            <div className="fixed inset-0 pointer-events-none z-50">
              {[...Array(100)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    y: -100,
                    x: Math.random() * 100,
                    rotate: 0,
                    scale: 0
                  }}
                  animate={{ 
                    y: '100vh',
                    x: Math.random() * 100,
                    rotate: 360,
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay: i * 0.02,
                    ease: "easeOut"
                  }}
                  className="absolute text-2xl"
                  style={{ left: `${i % 20 * 5}%` }}
                >
                  {['💖', '✨', '🎉', '🥳', '💕', '🎊', '💍', '🌸'][Math.floor(Math.random() * 8)]}
                </motion.div>
              ))}
            </div>
            
            <div className="relative z-10">
              <motion.h2
                animate={{ 
                  scale: [1, 1.1, 1],
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="text-3xl font-bold mb-6"
                style={{ color: '#FF4D6D' }}
              >
                CONGRATULATIONS! 🎊
              </motion.h2>
              
              <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
                <p className="text-xl mb-4" style={{ color: '#2B2B2B' }}>
                  {proposalData.senderName} ❤️ {proposalData.recipientName}
                </p>
                <p className="text-lg mb-4" style={{ color: '#FF4D6D' }}>
                  Official Valentine Couple! 💑
                </p>
                <div className="text-4xl mb-4">
                  💍✨💖
                </div>
                <p className="text-sm opacity-70" style={{ color: '#2B2B2B' }}>
                  You two look perfect together!
                </p>
              </div>
              
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStage('end')}
                className="py-3 px-6 rounded-full font-medium"
                style={{ 
                  backgroundColor: '#FFD6E0',
                  color: '#FF4D6D'
                }}
              >
                Continue Celebration! 🎊
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {/* End Stage */}
        {stage === 'end' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="flex justify-center mb-8">
              <div className="relative">
                <SenderCharacter emotion="happy" gender={proposalData.senderGender || 'boy'} />
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="absolute -top-4 -right-4 text-3xl"
                >
                  💖
                </motion.div>
              </div>
              <div className="relative">
                <RecipientCharacter emotion="blushing" hasRing={true} gender={proposalData.recipientGender || 'girl'} />
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, -10, 10, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: 0.5
                  }}
                  className="absolute -top-4 -left-4 text-3xl"
                >
                  ✨
                </motion.div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#FF4D6D' }}>
              Proposal Complete! 💌
            </h2>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
              <p className="text-lg mb-4" style={{ color: '#2B2B2B' }}>
                A magical moment created by {proposalData.senderName} just for you!
              </p>
              <div className="text-3xl mb-4">
                💌✨💍
              </div>
              <p className="text-sm opacity-70" style={{ color: '#2B2B2B' }}>
                Share your happiness! Let {proposalData.senderName} know you said YES! 💖
              </p>
            </div>
            
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/'}
                className="w-full py-3 px-6 rounded-full font-medium"
                style={{ 
                  backgroundColor: '#FF4D6D',
                  color: '#FFFFFF'
                }}
              >
                Create Your Own Proposal! ✨
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="w-full py-3 px-6 rounded-full font-medium"
                style={{ 
                  backgroundColor: '#FFD6E0',
                  color: '#FF4D6D'
                }}
              >
                Relive the Magic! 🔄
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/proposal/:id" element={<ProposalPage />} />
        {/* Redirect old /p route to new format */}
        <Route path="/p" element={<ProposalPage />} />
      </Routes>
    </Router>
  );
};

export default App;
