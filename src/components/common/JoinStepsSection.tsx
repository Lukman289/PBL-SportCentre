"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "./AnimationUtils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Step {
  number: number;
  title: string;
  description: string;
}

export function JoinStepsSection() {
  const steps: Step[] = [
    {
      number: 1,
      title: "Daftar",
      description: "Buat akun sebagai pemilik sport center dan lengkapi profil bisnis Anda"
    },
    {
      number: 2,
      title: "Setup",
      description: "Tambahkan Admin Sport Center, dan Lapangan"
    },
    {
      number: 3,
      title: "Terima Booking",
      description: "Mulai terima reservasi dan kelola bisnis Anda dengan platform kami"
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
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
      
      <div className="container mx-auto relative z-10 px-4 sm:px-6 md:px-8">
        <motion.div 
          className="text-center mb-8 sm:mb-16"
          variants={fadeInUp}
        >
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Cara Bergabung</h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Tiga langkah mudah untuk memulai dengan platform kami
          </p>
        </motion.div>
        
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-12 bottom-12 w-0.5 bg-gradient-to-b from-primary/80 via-primary/50 to-primary/20 hidden md:block"></div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-6xl mx-auto relative z-10"
            variants={staggerContainer}
          >
            {steps.map((step, index) => (
              <motion.div 
                key={step.number}
                className="flex flex-col items-center text-center relative"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 0.6, delay: index * 0.2 }
                  }
                }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                {/* Step number */}
                <div className="relative mb-4 sm:mb-6">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl transform scale-150 animate-pulse"></div>
                  <div className="bg-gradient-to-br from-primary to-primary/80 text-white w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold relative z-10 shadow-lg shadow-primary/20">
                    {step.number}
                  </div>
                </div>
                
                {/* Content */}
                <div className="bg-white/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-sm border border-white/20 hover:shadow-md transition-all w-full">
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                
                {/* Connector arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-3 sm:my-4 md:hidden">
                    <ArrowRight className="text-primary/50 animate-pulse" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        <motion.div 
          className="flex justify-center mt-8 sm:mt-16"
          variants={fadeInUp}
        >
          <Link href="/auth/register?role=owner">
            <Button size="lg" className="gap-1 sm:gap-2 text-sm sm:text-base px-4 sm:px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all">
              Mulai Sekarang <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.section>
  );
}
