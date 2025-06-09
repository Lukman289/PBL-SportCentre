"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative py-24 overflow-hidden w-full h-screen flex items-center justify-center">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60 z-10"></div>
      
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1936&q=80"
          alt="Sport Center"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        {/* Top left corner decoration */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        
        {/* Bottom right corner decoration */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 translate-y-1/3"></div>
        
        {/* Animated floating circles */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-8 h-8 bg-white/30 rounded-full"
          animate={{ 
            y: [0, -15, 0], 
            opacity: [0.3, 0.8, 0.3] 
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        ></motion.div>
        
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-white/20 rounded-full"
          animate={{ 
            y: [0, 20, 0], 
            opacity: [0.2, 0.6, 0.2] 
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        ></motion.div>
        
        <motion.div 
          className="absolute top-1/2 right-1/3 w-4 h-4 bg-white/20 rounded-full"
          animate={{ 
            y: [0, -10, 0], 
            opacity: [0.2, 0.5, 0.2] 
          }}
          transition={{ 
            duration: 3.5, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        ></motion.div>
      </div>
      
      {/* Content */}
      <div className="w-full max-w-7xl mx-auto text-center relative z-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-white drop-shadow-md">
            <span className="relative inline-block">
              Reservasi Lapangan
              <motion.span 
                className="absolute -bottom-2 left-0 w-full h-1 bg-white/70 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 1 }}
              ></motion.span>
            </span>
            <br />
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Jadi Lebih Mudah
            </span>
          </h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-3xl mx-auto drop-shadow backdrop-blur-sm bg-black/5 p-3 sm:p-4 rounded-lg">
            Temukan dan pesan lapangan olahraga favorit Anda dengan cepat dan
            mudah. Bayar online dan dapatkan konfirmasi instan.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/branches">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 hover:text-primary transition-colors shadow-lg shadow-primary/20"
              >
                Jelajahi Cabang
              </Button>
            </motion.div>
          </Link>
          
          <Link href="/fields">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white/20 shadow-lg shadow-primary/20"
              >
                Lihat Lapangan
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 