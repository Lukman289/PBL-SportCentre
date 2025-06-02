"use client";

import { HomeLayout } from "@/components/layout/HomeLayout";
import { useEffect, useState } from "react";
import { branchApi, fieldApi } from "@/api";
import { Branch } from "@/types";
import {
  HeroSection,
  StatsSection,
  FeaturesSection,
  OwnerBenefitsSection,
  TestimonialsSection,
  FaqSection,
  CtaSection,
  BranchesSection,
  ContactSection
} from "@/components/common";

export default function HomePage() {
  const [featuredBranches, setFeaturedBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalBranches, setTotalBranches] = useState(0);
  const [totalFields, setTotalFields] = useState(0);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await branchApi.getBranches();
        const branches = response.data || [];
        setTotalBranches(response.meta?.totalItems || 0);
        if (Array.isArray(branches)) {
          setFeaturedBranches(branches.slice(0, 4));
        } else {
          console.error("branches is not an array:", branches);
          setFeaturedBranches([]);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        setFeaturedBranches([]);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTotalFields = async () => {
      try {
        const response = await fieldApi.getAllFields();
        setTotalFields(response.meta?.totalItems || 0);
      } catch (error) {
        console.error("Error fetching total fields:", error);
      }
    }
    
    fetchTotalFields();
    fetchBranches();
  }, []);

  // Data testimonial
  const testimonials = [
    {
      id: 1,
      name: "Andi Wijaya",
      role: "Atlet Badminton",
      text: "Aplikasi ini sangat memudahkan saya dalam memesan lapangan badminton. Tidak perlu lagi menelepon atau datang langsung ke tempat. Sangat efisien!",
      avatar: "https://i.pravatar.cc/150?img=1",
      rating: 5,
    },
    {
      id: 2,
      name: "Diana Putri",
      role: "Pemain Basket Amatir",
      text: "Sistem booking yang mudah dan pembayaran yang aman. Saya dan tim basket saya selalu menggunakan aplikasi ini untuk memesan lapangan.",
      avatar: "https://i.pravatar.cc/150?img=5",
      rating: 4,
    },
    {
      id: 3,
      name: "Budi Santoso",
      role: "Penggemar Futsal",
      text: "Sangat puas dengan layanan Sport Center. Banyak pilihan lapangan berkualitas dengan harga yang bersaing. Recommended!",
      avatar: "https://i.pravatar.cc/150?img=3",
      rating: 5,
    },
  ];

  // Data testimoni pemilik sport center
  const ownerTestimonials = [
    {
      id: 1,
      name: "Hendra Gunawan",
      role: "Pemilik Rajawali Sport Center",
      text: "Sejak bergabung dengan platform ini, pendapatan sport center kami meningkat 40%. Sistem manajemen yang efisien membuat operasional kami jauh lebih teratur.",
      avatar: "https://i.pravatar.cc/150?img=12",
      rating: 5,
    },
    {
      id: 2,
      name: "Siti Rahayu",
      role: "Pemilik Garuda Futsal",
      text: "Platform ini membantu kami mengelola jadwal dengan lebih baik dan mengurangi pembatalan mendadak. Laporan analitik juga sangat membantu untuk pengambilan keputusan bisnis.",
      avatar: "https://i.pravatar.cc/150?img=25",
      rating: 5,
    },
  ];

  // Data untuk FAQ
  const faqs = [
    {
      question: "Bagaimana cara memesan lapangan?",
      answer: "Anda dapat memesan lapangan dengan memilih cabang, lapangan, dan waktu yang diinginkan. Setelah itu, lakukan pembayaran dan Anda akan mendapatkan konfirmasi reservasi."
    },
    {
      question: "Metode pembayaran apa saja yang tersedia?",
      answer: "Kami menerima pembayaran melalui transfer bank, e-wallet, dan kartu kredit/debit."
    },
    {
      question: "Bagaimana jika saya perlu membatalkan reservasi?",
      answer: "Pembatalan dapat dilakukan minimal 24 jam sebelum jadwal reservasi untuk mendapatkan refund sesuai kebijakan."
    },
    {
      question: "Apakah ada biaya tambahan untuk menggunakan aplikasi?",
      answer: "Tidak ada biaya tambahan untuk menggunakan aplikasi kami. Anda hanya membayar sesuai harga lapangan yang tertera."
    }
  ];

  // Data untuk FAQ Pemilik
  const ownerFaqs = [
    {
      question: "Berapa biaya untuk bergabung dengan platform?",
      answer: "Kami menawarkan beberapa paket berlangganan dengan fitur yang berbeda. Biaya berlangganan dimulai dari Rp 500.000 per bulan dengan komisi 5% per transaksi. Hubungi tim kami untuk penawaran khusus."
    },
    {
      question: "Berapa lama proses integrasi platform?",
      answer: "Proses integrasi biasanya memakan waktu 1-3 hari kerja, tergantung pada kompleksitas bisnis Anda. Tim kami akan membantu sepanjang proses untuk memastikan transisi yang lancar."
    },
    {
      question: "Bagaimana sistem pembayaran bekerja?",
      answer: "Pelanggan membayar melalui platform kami dengan berbagai metode pembayaran. Dana akan ditransfer ke rekening Anda setiap minggu setelah dikurangi komisi. Laporan keuangan tersedia secara real-time di dashboard Anda."
    },
    {
      question: "Apakah saya bisa mengatur harga sendiri?",
      answer: "Ya, Anda memiliki kendali penuh atas harga lapangan, jadwal operasional, dan kebijakan pembatalan. Platform kami hanya menyediakan infrastruktur untuk mengelola bisnis Anda dengan lebih efisien."
    }
  ];

  return (
    <HomeLayout>
      <HeroSection />
      <StatsSection totalBranches={totalBranches} totalFields={totalFields} />
      <FeaturesSection />
      <OwnerBenefitsSection />
      
      {/* Testimoni Pemilik Sport Center */}
      <TestimonialsSection 
        title="Apa Kata Pemilik Sport Center?"
        subtitle="Pengalaman pemilik sport center yang telah menggunakan platform kami"
        testimonials={ownerTestimonials}
        bgClass="bg-gradient-to-br from-primary/5 to-primary/10"
      />

      {/* Statistik Bisnis */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Tingkatkan Performa Bisnis Anda</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hasil nyata yang diperoleh pemilik sport center yang bergabung dengan platform kami
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all text-center">
              <h3 className="text-5xl font-bold text-primary mb-2">40%</h3>
              <p className="text-lg font-medium">Peningkatan Pendapatan</p>
              <p className="text-muted-foreground">Rata-rata dalam 6 bulan pertama</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all text-center">
              <h3 className="text-5xl font-bold text-primary mb-2">65%</h3>
              <p className="text-lg font-medium">Pengurangan Pembatalan</p>
              <p className="text-muted-foreground">Dengan sistem konfirmasi otomatis</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all text-center">
              <h3 className="text-5xl font-bold text-primary mb-2">85%</h3>
              <p className="text-lg font-medium">Efisiensi Operasional</p>
              <p className="text-muted-foreground">Dengan manajemen terpusat</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all text-center">
              <h3 className="text-5xl font-bold text-primary mb-2">3x</h3>
              <p className="text-lg font-medium">Jangkauan Pelanggan</p>
              <p className="text-muted-foreground">Peningkatan basis pelanggan</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ untuk pemilik sport center */}
      <FaqSection 
        title="FAQ Untuk Pemilik Sport Center"
        subtitle="Jawaban untuk pertanyaan umum dari pemilik sport center"
        faqs={ownerFaqs}
        bgClass="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl my-16"
      />

      <BranchesSection branches={featuredBranches} isLoading={isLoading} />
      
      <TestimonialsSection testimonials={testimonials} />
      
      <FaqSection faqs={faqs} />
      
      <CtaSection />

      <ContactSection />
    </HomeLayout>
  );
}
