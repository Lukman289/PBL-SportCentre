"use client";

import { Calendar, CreditCard, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
  // Data untuk fitur-fitur
  const features = [
    {
      icon: <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />,
      title: "Reservasi Mudah",
      description: "Pesan lapangan kapan saja dan di mana saja dengan beberapa klik"
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
      icon: <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />,
      title: "Komunitas Olahraga",
      description: "Bergabunglah dengan komunitas olahraga lokal di sekitar Anda"
    }
  ];

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
      className="py-10 sm:py-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl sm:rounded-3xl my-8 sm:my-16 mx-3 sm:mx-6 md:mx-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div 
          className="text-center mb-8 sm:mb-16"
          variants={fadeInUp}
        >
          <h2 className="text-xl sm:text-4xl font-bold mb-2 sm:mb-4">Kenapa Memilih Kami?</h2>
          <p className="text-sm sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Platform reservasi lapangan olahraga terbaik dengan berbagai fitur unggulan
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8"
          variants={staggerContainer}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white p-3 sm:p-8 rounded-lg shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center"
              variants={scaleIn}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="mb-2 sm:mb-4">
                {feature.icon}
              </div>
              <h3 className="text-base sm:text-xl font-bold mb-1 sm:mb-2">{feature.title}</h3>
              <p className="text-xs sm:text-base text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
} 