"use client";

import { PhoneCall, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

export function ContactSection() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.section 
      className="py-12 sm:py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <motion.div 
          className="text-center mb-8 sm:mb-16"
          variants={fadeInUp}
        >
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Hubungi Kami</h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Punya pertanyaan? Jangan ragu untuk menghubungi kami
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto"
          variants={staggerContainer}
        >
          <motion.div 
            className="flex flex-col items-center text-center p-4 sm:p-6"
            variants={scaleIn}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-primary/10 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
              <PhoneCall className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Telepon</h3>
            <p className="text-sm sm:text-base text-muted-foreground">+62 812 3456 7890</p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center text-center p-4 sm:p-6"
            variants={scaleIn}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-primary/10 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
              <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Alamat</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Jl. Soekarno Hatta No. 9, Malang</p>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center text-center p-4 sm:p-6"
            variants={scaleIn}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-primary/10 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Jam Operasional</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Senin - Minggu: 08.00 - 22.00</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
} 