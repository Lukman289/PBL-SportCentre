"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, scaleIn } from "./AnimationUtils";
import { Check, X, Star, Shield, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PlanFeature {
  name: string;
  member: boolean;
  owner: boolean;
}

export function FeatureComparisonSection() {
  const features: PlanFeature[] = [
    { name: "Reservasi lapangan", member: true, owner: true },
    { name: "Pembayaran online", member: true, owner: true },
    { name: "Histori pemesanan", member: true, owner: true },
    { name: "Ulasan lapangan", member: true, owner: false },
    { name: "Manajemen jadwal", member: false, owner: true },
    { name: "Dashboard analitik", member: false, owner: true },
    { name: "Laporan pendapatan", member: false, owner: true },
    { name: "Promosi & diskon", member: false, owner: true },
    { name: "Manajemen pelanggan", member: false, owner: true },
  ];

  const memberBenefits = [
    "Akses ke berbagai lapangan olahraga berkualitas",
    "Reservasi mudah dan cepat kapan saja",
    "Pembayaran aman dan praktis",
    "Bergabung dengan komunitas olahraga"
  ];

  const ownerBenefits = [
    "Platform manajemen lapangan yang efisien",
    "Tingkatkan visibilitas dan jangkauan pelanggan",
    "Sistem pembayaran terintegrasi dan aman",
    "Analisis data dan laporan performa bisnis"
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
      <div className="absolute top-40 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto relative z-10 px-4 sm:px-6 md:px-8">
        <motion.div 
          className="text-center mb-8 sm:mb-16"
          variants={fadeInUp}
        >
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Bergabung Bersama Kami</h2>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Pilih peran Anda dalam ekosistem Sport Center kami
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-2 gap-3 sm:gap-6 max-w-6xl mx-auto"
          variants={staggerContainer}
        >
          {/* Member Card */}
          <motion.div 
            className="relative bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-primary/10 overflow-hidden h-full"
            variants={scaleIn}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
          >
            {/* Top gradient bar */}
            <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            
            <div className="p-4 sm:p-6 md:p-10 flex flex-col h-full">
              <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full mx-auto mb-3 sm:mb-4 md:mb-6">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-blue-600" />
              </div>
              
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 text-center">Untuk Member</h3>
              
              <div className="mb-4 sm:mb-6 md:mb-8 py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 bg-blue-50 rounded-xl flex-grow">
                <ul className="space-y-1 sm:space-y-2 md:space-y-4">
                  {memberBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                      <div className="bg-blue-100 p-1 rounded-full mt-1 flex-shrink-0">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                      <span className="text-xs sm:text-sm md:text-base">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link href="/auth/register" className="block mt-auto">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm md:text-base py-1 sm:py-1.5 md:py-2" size="lg">
                  Daftar Sebagai Member
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* Owner Card */}
          <motion.div 
            className="relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl shadow-md hover:shadow-lg transition-all border border-primary/20 overflow-hidden h-full"
            variants={scaleIn}
            whileHover={{ y: -10, transition: { duration: 0.2 } }}
          >
            {/* Top gradient bar */}
            <div className="h-2 bg-gradient-to-r from-primary to-primary/80"></div>
            
            <div className="p-4 sm:p-6 md:p-10 flex flex-col h-full">
              <div className="bg-primary/20 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full mx-auto mb-3 sm:mb-4 md:mb-6">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-primary" />
              </div>
              
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 text-center">Untuk Pemilik Sport Center</h3>
              
              <div className="mb-4 sm:mb-6 md:mb-8 py-2 sm:py-3 md:py-4 px-3 sm:px-4 md:px-6 bg-primary/5 rounded-xl flex-grow">
                <ul className="space-y-1 sm:space-y-2 md:space-y-4">
                  {ownerBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                      <div className="bg-primary/10 p-1 rounded-full mt-1 flex-shrink-0">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <span className="text-xs sm:text-sm md:text-base">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link href="/auth/register?role=owner" className="block mt-auto">
                <Button className="w-full bg-primary/90 hover:bg-primary text-xs sm:text-sm md:text-base py-1 sm:py-1.5 md:py-2" size="lg">
                  Daftar Sebagai Pemilik
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Feature comparison table */}
        <motion.div 
          className="mt-12 sm:mt-20 max-w-4xl mx-auto overflow-hidden rounded-xl shadow-lg border border-primary/10"
          variants={fadeInUp}
        >
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 sm:p-6 text-center">
            <h3 className="text-lg sm:text-xl font-bold">Perbandingan Fitur</h3>
          </div>
          
          <div className="bg-white overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 sm:py-4 px-3 sm:px-6 text-left text-sm sm:text-base">Fitur</th>
                  <th className="py-3 sm:py-4 px-3 sm:px-6 text-center text-sm sm:text-base">Member</th>
                  <th className="py-3 sm:py-4 px-3 sm:px-6 text-center text-sm sm:text-base">Pemilik</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2 sm:py-3 px-3 sm:px-6 text-sm sm:text-base">{feature.name}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-6 text-center">
                      {feature.member ? (
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-6 text-center">
                      {feature.owner ? (
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}