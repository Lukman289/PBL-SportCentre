"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative py-24 overflow-hidden w-full h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/60 z-10"></div>
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1936&q=80"
          alt="Sport Center"
          fill
          className="object-cover"
          priority
        />
      </div>
      
      <div className="container mx-auto text-center relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white drop-shadow-md">
          Reservasi Lapangan <br />
          Jadi Lebih Mudah
        </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
        <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow">
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
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 hover:text-primary transition-colors"
            >
              Jelajahi Cabang
            </Button>
          </Link>
          <Link href="/fields">
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white/20"
            >
              Lihat Lapangan
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 