"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "./AnimationUtils";
import { ArrowUpRight, TrendingUp, Users, Clock, ShieldCheck } from "lucide-react";

interface StatItem {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export function BusinessStatsSection() {
  const stats: StatItem[] = [
    {
      value: "40%",
      label: "Peningkatan Pendapatan",
      description: "Rata-rata dalam 6 bulan pertama",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "from-green-500/20 to-green-500/5"
    },
    {
      value: "65%",
      label: "Pengurangan Pembatalan",
      description: "Dengan sistem konfirmasi otomatis",
      icon: <Clock className="h-6 w-6" />,
      color: "from-blue-500/20 to-blue-500/5"
    },
    {
      value: "85%",
      label: "Efisiensi Operasional",
      description: "Dengan manajemen terpusat",
      icon: <ShieldCheck className="h-6 w-6" />,
      color: "from-purple-500/20 to-purple-500/5"
    },
    {
      value: "3x",
      label: "Jangkauan Pelanggan",
      description: "Peningkatan basis pelanggan",
      icon: <Users className="h-6 w-6" />,
      color: "from-orange-500/20 to-orange-500/5"
    }
  ];

  return (
    <motion.section 
      className="py-16 sm:py-24 relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto relative z-10 px-4 sm:px-6 md:px-8">
        <motion.div 
          className="text-center mb-8 sm:mb-16"
          variants={fadeInUp}
        >
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Tingkatkan Performa Bisnis Anda</h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Hasil nyata yang diperoleh pemilik sport center yang bergabung dengan platform kami
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 max-w-6xl mx-auto"
          variants={staggerContainer}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className={`relative group overflow-hidden bg-gradient-to-br ${stat.color} p-4 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-white/10`}
              variants={scaleIn}
              whileHover={{ 
                y: -5, 
                transition: { duration: 0.2 } 
              }}
            >
              <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {stat.icon}
              </div>
              
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      {stat.icon}
                    </div>
                    <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  </div>
                  <h3 className="text-3xl sm:text-5xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {stat.value}
                  </h3>
                  <p className="text-base sm:text-lg font-medium">{stat.label}</p>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3">{stat.description}</p>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute bottom-0 right-0 w-12 sm:w-16 h-12 sm:h-16 bg-white/5 rounded-tl-3xl"></div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
} 