'use client';

import { motion } from 'framer-motion';
import { Button } from '@mui/material';
import Link from 'next/link';
import { Home, ArrowLeft, BookX, Compass } from 'lucide-react';

export default function NotFoundPage() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  const comicPanelVariants = {
    initial: { scale: 0.8, opacity: 0, rotate: -5 },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const glitchVariants = {
    initial: { x: 0 },
    animate: {
      x: [-2, 2, -2, 2, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 3,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light/10 via-surface-light to-secondary-light/10 dark:from-surface-dark dark:via-gray-900 dark:to-primary-dark/10 flex items-center justify-center px-4 py-12 overflow-hidden relative">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-primary-light/20 dark:bg-primary-dark/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-32 h-32 bg-secondary-light/20 dark:bg-secondary-dark/20 rounded-full blur-3xl"
        animate={{
          scale: [1.5, 1, 1.5],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main Content */}
      <motion.div
        className="max-w-4xl w-full text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Floating Book Icon */}
        <motion.div
          className="flex justify-center mb-8"
          variants={floatingVariants}
          initial="initial"
          animate="animate"
        >
          <div className="relative">
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <BookX className="w-12 h-12 text-white" strokeWidth={2.5} />
            </motion.div>
            {/* Comic-style effect lines */}
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <path
                  d="M5 20 L15 15 M5 25 L15 20 M5 30 L15 25"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-red-500 dark:text-red-400"
                  fill="none"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* 404 Number with Glitch Effect */}
        <motion.div variants={itemVariants} className="mb-6">
          <motion.h1
            className="text-[120px] md:text-[180px] lg:text-[220px] font-black leading-none mb-4"
            variants={glitchVariants}
            initial="initial"
            animate="animate"
          >
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-2xl">
              404
            </span>
          </motion.h1>
        </motion.div>

        {/* Comic Speech Bubble */}
        <motion.div
          className="mb-12 flex justify-center"
          variants={comicPanelVariants}
          initial="initial"
          animate="animate"
        >
          <div className="relative max-w-lg">
            {/* Speech Bubble */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl px-8 py-6 shadow-2xl border-4 border-gray-900 dark:border-white relative transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              {/* Comic-style border effect */}
              <div className="absolute -top-1 -left-1 -right-1 -bottom-1 bg-gradient-to-br from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark rounded-3xl -z-10 opacity-50" />
              
              <motion.h2
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3"
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                Page Not Found
              </motion.h2>
              

              {/* Speech Bubble Tail */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[25px] border-t-gray-900 dark:border-t-white" />
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-[22px]">
                  <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[20px] border-t-white dark:border-t-gray-800" />
                </div>
              </div>
            </div>

            
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        >
          

          <Link href="/comics" passHref>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Compass />}
              sx={{
                color: 'var(--primary-light)',
                borderColor: 'var(--primary-light)',
                fontWeight: 600,
                fontSize: '1.1rem',
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                borderWidth: '2px',
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: '2px',
                  borderColor: 'var(--primary-dark)',
                  backgroundColor: 'rgba(0, 210, 106, 0.1)',
                  transform: 'translateY(-2px)',
                },
                '.dark &': {
                  color: 'var(--primary-dark)',
                  borderColor: 'var(--primary-dark)',
                  '&:hover': {
                    borderColor: 'var(--primary-light)',
                    backgroundColor: 'rgba(0, 255, 129, 0.1)',
                  },
                },
              }}
            >
             Browse Comics
            </Button>
          </Link>
        </motion.div>

        {/* Helpful Links */}
        <motion.div
          variants={itemVariants}
          className="text-sm text-gray-600 dark:text-gray-400"
        >
          
        </motion.div>

       
      </motion.div>


      
    </div>
  );
}
