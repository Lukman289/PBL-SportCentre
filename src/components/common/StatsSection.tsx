"use client";

import { MapPin, LayoutGrid, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface StatsSectionProps {
  totalBranches: number;
  totalFields: number;
}

export function StatsSection({ totalBranches, totalFields }: StatsSectionProps) {
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
      className="py-10 sm:py-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInUp}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8"
          variants={staggerContainer}
        >
          <motion.div 
            className="bg-primary/5 p-6 sm:p-8 rounded-xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all"
            variants={scaleIn}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-primary/10 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{totalBranches} Cabang</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Tersebar di berbagai kota</p>
          </motion.div>
          
          <motion.div 
            className="bg-primary/5 p-6 sm:p-8 rounded-xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all"
            variants={scaleIn}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-primary/10 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
              <LayoutGrid className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{totalFields} Lapangan</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Tersedia untuk berbagai olahraga</p>
          </motion.div>
          
          <motion.div 
            className="bg-primary/5 p-6 sm:p-8 rounded-xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all"
            variants={scaleIn}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="bg-primary/10 p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">24/7 Akses</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Reservasi kapan saja</p>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
} 