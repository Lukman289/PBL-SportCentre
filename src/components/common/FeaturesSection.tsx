"use client";

import { Calendar, CreditCard, Shield, Users, Search, MapPin, Clock, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export function FeaturesSection() {
  // Animasi untuk komponen
  const animations = {
    fadeInUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6 }
      }
    },
    fadeInLeft: {
      hidden: { opacity: 0, x: -20 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.6 }
      }
    },
    fadeInRight: {
      hidden: { opacity: 0, x: 20 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.6 }
      }
    },
    staggerContainer: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2
        }
      }
    },
    scaleIn: {
      hidden: { scale: 0.8, opacity: 0 },
      visible: { 
        scale: 1, 
        opacity: 1,
        transition: { duration: 0.5 }
      }
    }
  };

  // Data untuk fitur-fitur
  const features = [
    {
      icon: <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />,
      title: "Reservasi Mudah",
      description: "Pesan lapangan kapan saja dan di mana saja dengan beberapa klik"
    },
    {
      icon: <Search className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />,
      title: "Pencarian Cepat",
      description: "Temukan lapangan yang tersedia sesuai dengan kebutuhan Anda"
    },
    {
      icon: <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />,
      title: "Pembayaran Aman",
      description: "Berbagai metode pembayaran yang aman dan terpercaya"
    },
    {
      icon: <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />,
      title: "Jaminan Kualitas",
      description: "Semua lapangan dijamin berkualitas dan terawat dengan baik"
    },
    {
      icon: <MapPin className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />,
      title: "Lokasi Strategis",
      description: "Lapangan tersebar di berbagai lokasi strategis di kota Anda"
    },
    {
      icon: <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />,
      title: "Akses 24/7",
      description: "Akses sistem reservasi kapan saja sesuai kebutuhan Anda"
    },
    {
      icon: <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />,
      title: "Komunitas Olahraga",
      description: "Bergabunglah dengan komunitas olahraga lokal di sekitar Anda"
    },
    {
      icon: <Smartphone className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />,
      title: "Aplikasi Mobile",
      description: "Akses semua fitur melalui aplikasi mobile yang responsif"
    }
  ];

  return (
    <motion.section 
      className="py-16 sm:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Pengenalan Platform */}
      <div className="container mx-auto px-4 sm:px-6 mb-16">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <motion.div 
            className="md:w-1/2"
            variants={animations.fadeInLeft}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Platform Reservasi Sport Center Terbaik di Indonesia</h2>
            <p className="text-muted-foreground mb-6">
              <b>Jadwal.in</b> adalah platform reservasi lapangan olahraga online yang menghubungkan pengelola lapangan dengan para pengguna. 
              Kami menyediakan solusi lengkap untuk memudahkan pencarian, pemesanan, dan pembayaran lapangan olahraga.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-2">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">100+ Lokasi</span>
              </div>
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-2">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">10.000+ Pengguna</span>
              </div>
              <div className="flex items-center">
                <div className="bg-primary/10 p-2 rounded-full mr-2">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm">50.000+ Reservasi</span>
              </div>
            </div>
          </motion.div>
          <motion.div 
            className="md:w-1/2 relative h-64 sm:h-80 w-full rounded-lg overflow-hidden mt-8 md:mt-0"
            variants={animations.fadeInRight}
          >
            <Image
              src="https://images.unsplash.com/photo-1552667466-07770ae110d0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
              alt="Jadwalin Sport Center Platform"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-lg"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1552667466-07770ae110d0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80";
              }}
            />
          </motion.div>
        </div>
      </div>
      
      {/* Fitur-fitur */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl sm:rounded-3xl py-12 sm:py-16 mx-3 sm:mx-6 md:mx-8">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-10 sm:mb-16"
            variants={animations.fadeInUp}
          >
            <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Fitur Unggulan Kami</h2>
            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Nikmati berbagai fitur yang dirancang untuk memberikan pengalaman reservasi lapangan olahraga yang menyenangkan
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={animations.staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white p-4 sm:p-6 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center h-full"
                variants={animations.scaleIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="bg-primary/10 p-3 rounded-full mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
} 