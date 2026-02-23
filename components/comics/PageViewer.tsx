'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Menu, ZoomIn, ZoomOut } from 'lucide-react';
import { Page } from '@/types/comic.types';
import Image from 'next/image';
import { IconButton } from '@mui/material';

interface PageViewerProps {
  pages: Page[];
  chapterId: string;
  comicId: string;
  chapterTitle: string;
  chapterNumber: number;
  hasNextChapter?: boolean;
  hasPrevChapter?: boolean;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
}

export function PageViewer({
  pages,
  chapterId,
  comicId,
  chapterTitle,
  chapterNumber,
  hasNextChapter = false,
  hasPrevChapter = false,
  onNextChapter,
  onPrevChapter,
}: PageViewerProps) {
  const router = useRouter();
  const [showControls, setShowControls] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const { scrollYProgress } = useScroll();
  const [readProgress, setReadProgress] = useState(0);

  // Sort pages by page_order
  const sortedPages = [...pages].sort((a, b) => a.page_order - b.page_order);

  // Track scroll progress
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      setReadProgress(latest * 100);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Auto-hide controls on scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide controls
        setShowControls(false);
      } else {
        // Scrolling up - show controls
        setShowControls(true);
        resetHideTimer();
      }
      
      lastScrollY = currentScrollY;
    };

    const handleMouseMove = () => {
      setShowControls(true);
      resetHideTimer();
    };

    const resetHideTimer = () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      hideControlsTimeout.current = setTimeout(() => {
        if (window.scrollY > 100) {
          setShowControls(false);
        }
      }, 3000);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && hasNextChapter) {
        onNextChapter?.();
      } else if (e.key === 'ArrowLeft' && hasPrevChapter) {
        onPrevChapter?.();
      } else if (e.key === 'Escape') {
        router.push(`/comics/${comicId}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasNextChapter, hasPrevChapter, onNextChapter, onPrevChapter, router, comicId]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-primary-light dark:bg-primary-dark z-50 origin-left"
        style={{ scaleX: readProgress / 100 }}
      />

      {/* Top Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/90 to-transparent px-4 py-4"
          >
            <div className="container mx-auto flex items-center justify-between">
              {/* Back Button */}
              <IconButton
                onClick={() => router.push(`/comics/${comicId}`)}
                sx={{ color: 'white' }}
              >
                <X size={24} />
              </IconButton>

              {/* Chapter Info */}
              <div className="flex-1 text-center text-white">
                <h2 className="text-lg font-semibold">Chapter {chapterNumber}</h2>
                <p className="text-sm text-gray-300">{chapterTitle}</p>
              </div>

              {/* Menu Button */}
              <IconButton
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                sx={{ color: 'white' }}
              >
                <Menu size={24} />
              </IconButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-surface dark:bg-surface-dark shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Pages</h3>
                  <IconButton onClick={() => setIsMenuOpen(false)} size="small">
                    <X size={20} />
                  </IconButton>
                </div>

                {/* Zoom Controls */}
                <div className="mb-6 flex items-center gap-2">
                  <span className="text-sm font-medium">Zoom:</span>
                  <IconButton onClick={handleZoomOut} size="small">
                    <ZoomOut size={18} />
                  </IconButton>
                  <span className="text-sm">{(zoom * 100).toFixed(0)}%</span>
                  <IconButton onClick={handleZoomIn} size="small">
                    <ZoomIn size={18} />
                  </IconButton>
                </div>

                {/* Page Thumbnails */}
                <div className="space-y-2">
                  {sortedPages.map((page, index) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        const element = document.getElementById(`page-${index}`);
                        element?.scrollIntoView({ behavior: 'smooth' });
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="relative w-16 h-20 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                        <Image
                          src={page.image_url}
                          alt={`Page ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <span className="text-sm font-medium">Page {index + 1}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pages Container */}
      <div className="container mx-auto max-w-4xl py-8 px-4">
        {sortedPages.map((page, index) => (
          <motion.div
            key={page.id}
            id={`page-${index}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="mb-4"
          >
            <div
              className="relative w-full"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.3s ease',
              }}
            >
              <Image
                src={page.image_url}
                alt={`Page ${index + 1}`}
                width={1200}
                height={1800}
                className="w-full h-auto"
                priority={index < 3}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/90 to-transparent px-4 py-6"
          >
            <div className="container mx-auto flex items-center justify-between">
              {/* Previous Chapter */}
              {hasPrevChapter ? (
                <button
                  onClick={onPrevChapter}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
                >
                  <ChevronLeft size={20} />
                  <span className="hidden sm:inline">Previous Chapter</span>
                </button>
              ) : (
                <div />
              )}

              {/* Page Counter */}
              <div className="text-white text-sm font-medium">
                {sortedPages.length} Pages
              </div>

              {/* Next Chapter */}
              {hasNextChapter ? (
                <button
                  onClick={onNextChapter}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-light hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  <span className="hidden sm:inline">Next Chapter</span>
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={() => router.push(`/comics/${comicId}`)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
                >
                  Back to Comic
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
