import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GiftAnimation({ gift, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getAnimationByType = (effectType) => {
    switch (effectType) {
      case "fire":
        return {
          particles: "🔥",
          color: "from-orange-500 to-red-500",
          count: 30
        };
      case "hearts":
        return {
          particles: "❤️",
          color: "from-pink-500 to-red-500",
          count: 25
        };
      case "confetti":
        return {
          particles: "🎉",
          color: "from-purple-500 to-pink-500",
          count: 35
        };
      case "explosion":
        return {
          particles: "💥",
          color: "from-yellow-500 to-orange-500",
          count: 40
        };
      case "rainbow":
        return {
          particles: "🌈",
          color: "from-cyan-500 to-purple-500",
          count: 20
        };
      case "stars":
        return {
          particles: "⭐",
          color: "from-yellow-400 to-amber-500",
          count: 25
        };
      case "lightning":
        return {
          particles: "⚡",
          color: "from-blue-500 to-cyan-500",
          count: 20
        };
      case "snow":
        return {
          particles: "❄️",
          color: "from-blue-300 to-cyan-300",
          count: 30
        };
      case "bubbles":
        return {
          particles: "🫧",
          color: "from-cyan-400 to-blue-400",
          count: 25
        };
      default:
        return {
          particles: "✨",
          color: "from-purple-400 to-pink-400",
          count: 30
        };
    }
  };

  const animation = getAnimationByType(gift.effect_type);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Main Gift Display - BIGGER and MORE PROMINENT */}
      <motion.div
        initial={{ scale: 0, opacity: 0, y: 200 }}
        animate={{ 
          scale: [0, 2, 1.5], 
          opacity: [0, 1, 1, 0.8, 0], 
          y: [200, -100] 
        }}
        transition={{ duration: 4, times: [0, 0.2, 0.5, 0.8, 1] }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000]"
      >
        <div className={`bg-gradient-to-r ${animation.color} rounded-3xl p-12 shadow-2xl border-4 border-white`}>
          <span className="text-[180px] block">{gift.gift_emoji}</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6 bg-black/80 backdrop-blur-md rounded-2xl p-6"
        >
          <p className="text-white text-5xl font-black drop-shadow-2xl mb-3">{gift.gift_name}</p>
          <p className="text-yellow-400 text-3xl font-bold drop-shadow-2xl mb-2">
            {gift.coin_value} Coins
          </p>
          <p className="text-purple-300 text-2xl font-semibold drop-shadow-lg">
            from {gift.sender_name}
          </p>
        </motion.div>
      </motion.div>

      {/* Particle Effects - MORE particles */}
      {Array.from({ length: animation.count }).map((_, i) => {
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 0.8;
        const randomDuration = 2.5 + Math.random() * 2;
        
        return (
          <motion.div
            key={i}
            initial={{ 
              x: `${randomX}vw`, 
              y: "110vh", 
              scale: 0,
              rotate: 0
            }}
            animate={{ 
              y: "-30vh",
              scale: [0, 1.5, 1, 0],
              rotate: 720,
              x: `${randomX + (Math.random() - 0.5) * 40}vw`
            }}
            transition={{ 
              duration: randomDuration,
              delay: randomDelay,
              ease: "easeOut"
            }}
            className="absolute text-6xl z-[9999]"
          >
            {animation.particles}
          </motion.div>
        );
      })}

      {/* Screen Flash Effect - MORE INTENSE */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.8 }}
        className={`absolute inset-0 bg-gradient-to-r ${animation.color} z-[9998]`}
      />

      {/* Side Fireworks */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 3, 0] }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-10 left-10 text-9xl z-[9999]"
      >
        🎆
      </motion.div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 3, 0] }}
        transition={{ duration: 1, delay: 0.7 }}
        className="absolute top-10 right-10 text-9xl z-[9999]"
      >
        🎆
      </motion.div>
    </div>
  );
}