"use client";

import { Calendar, CreditCard, Users, LayoutGrid, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function OwnerBenefitsSection() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
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
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Untuk Pemilik Sport Center</h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Kelola bisnis sport center Anda dengan lebih efisien dan tingkatkan pendapatan
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          <motion.div
            className="flex flex-col order-2 md:order-1"
            variants={fadeInUp}
          >
            <Image
              src="https://images.unsplash.com/photo-1551958219-acbc608c6377?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Sport Center Management"
              width={600}
              height={400}
              className="rounded-xl shadow-md object-cover h-[250px] sm:h-[400px]"
            />
          </motion.div>
          
          <motion.div
            className="flex flex-col justify-center order-1 md:order-2 mb-6 md:mb-0"
            variants={fadeInUp}
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center md:text-left">Tingkatkan Efisiensi Operasional</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full mt-1">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-sm sm:text-base">Manajemen Jadwal Otomatis</span>
                  <p className="text-xs sm:text-sm text-muted-foreground">Sistem booking otomatis yang mengurangi kesalahan dan tumpang tindih jadwal</p>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full mt-1">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-sm sm:text-base">Pembayaran Digital</span>
                  <p className="text-xs sm:text-sm text-muted-foreground">Terima pembayaran secara online dengan berbagai metode pembayaran</p>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full mt-1">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-sm sm:text-base">Manajemen Pelanggan</span>
                  <p className="text-xs sm:text-sm text-muted-foreground">Database pelanggan terintegrasi untuk meningkatkan loyalitas dan retensi</p>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full mt-1">
                  <LayoutGrid className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <span className="font-semibold text-sm sm:text-base">Dashboard Analitik</span>
                  <p className="text-xs sm:text-sm text-muted-foreground">Pantau performa bisnis Anda dengan laporan dan analitik yang komprehensif</p>
                </div>
              </li>
            </ul>
            
            <div className="mt-6 sm:mt-8 items-center flex justify-center md:justify-start">
              <Link href="/auth/register?role=owner">
                <Button size="lg" className="gap-1 sm:gap-2 text-sm sm:text-base">
                  Mulai Sekarang <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
} 