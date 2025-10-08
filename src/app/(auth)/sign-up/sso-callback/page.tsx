'use client';

import LoadingSpinner from '@/components/authComponents/LoadingSpinner';
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { motion } from 'framer-motion';

const loadingPhrases = ['Finalizing authentication...'];

export default function SSOCallback() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gradient-to-br from-background to-background/80"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full backdrop-blur-sm bg-opacity-80"
      >
        <motion.h2
          className="text-3xl font-bold mb-6 text-primary"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome To Reeler Ai
        </motion.h2>
        <div className="flex justify-center mb-6">
          <LoadingSpinner />
        </div>
        <motion.p
          className="text-lg text-muted-foreground mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {loadingPhrases}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/10 rounded-lg animate-pulse" />
          <div id="clerk-captcha" className="relative z-10"></div>
          <AuthenticateWithRedirectCallback />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
