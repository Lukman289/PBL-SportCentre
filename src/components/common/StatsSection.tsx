"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { branchApi, fieldApi } from "@/api";

// Import ApexCharts secara dinamis untuk menghindari error SSR
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

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

export function StatsSection() {
  // State untuk data
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartCategories, setChartCategories] = useState<string[]>([]);
  const [totalBranches, setTotalBranches] = useState<number>(0);
  const [totalFields, setTotalFields] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Format angka ke format rupiah
  const formatToRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  // Konfigurasi untuk chart
  const chartOptions = {
    chart: {
      type: 'area' as const,
      height: 200,
      sparkline: {
        enabled: false
      },
      toolbar: {
        show: false
      },
      background: 'transparent',
      fontFamily: 'inherit',
      zoom: {
        enabled: false
      }
    },
    colors: ['#EF4444'],
    stroke: {
      curve: 'smooth' as const,
      width: 3
    },
    fill: {
      type: 'gradient' as const,
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    tooltip: {
      fixed: {
        enabled: false
      },
      x: {
        show: true
      },
      y: {
        title: {
          formatter: function() {
            return 'Reservasi';
          }
        }
      },
      marker: {
        show: false
      }
    },
    grid: {
      show: false
    },
    xaxis: {
      categories: chartCategories,
      labels: {
        show: true,
        style: {
          colors: '#64748b',
          fontSize: '10px'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      show: false
    }
  };

  const chartSeries = [{
    name: 'Reservasi',
    data: chartData
  }];

  // Mengambil data dari API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mengambil data dari API yang tidak memerlukan login
        const [branchResponse, fieldResponse] = await Promise.all([
          await branchApi.getBranches(),
          await fieldApi.getAllFields()
        ]);
        
        // Menghitung total cabang dan lapangan
        const branchCount = branchResponse.meta?.totalItems || 0;
        const fieldCount = fieldResponse.meta?.totalItems || 0;
        
        setTotalBranches(branchCount);
        setTotalFields(fieldCount);
        
        // Membuat data chart berdasarkan bulan
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        const dummyData = [30, 40, 45, 50, 49, 60, 70, 91, 125, 150, 200, 220];
        
        setChartCategories(months);
        setChartData(dummyData);
      } catch {
        // Fallback data jika API gagal
        setChartCategories(['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']);
        setChartData([30, 40, 45, 50, 49, 60, 70, 91, 125, 150, 200, 220]);
        setTotalBranches(20);
        setTotalFields(80);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render komponen StatItem
  const StatItem = ({ value, label }: { value: string; label: string }) => (
    <motion.div variants={animations.scaleIn}>
      <h3 className="text-4xl sm:text-5xl font-bold mb-1">{value}</h3>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );

  return (
    <motion.section 
      className="py-8 sm:py-16 bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={animations.fadeInUp}
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          {/* Kolom kiri */}
          <motion.div 
            className="mb-8 md:mb-0 md:w-1/2 md:pr-8"
            variants={animations.fadeInUp}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Rekam Jejak Keunggulan Kami</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Lebih dari 10.000 pengguna aktif, {totalFields}+ lapangan tersedia di {totalBranches}+ cabang, dengan tingkat kepuasan pelanggan 95%.
            </p>
            <motion.button 
              className="bg-black text-white px-4 py-2 rounded-full text-sm inline-flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Bicara dengan kami
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
            
            {/* Chart */}
            <div className="mt-8 bg-white rounded-lg p-2 shadow-sm border border-gray-100">
              <div className="h-48">
                {!isLoading && typeof window !== 'undefined' && (
                  <ReactApexChart 
                    options={chartOptions}
                    series={chartSeries}
                    type="area"
                    height="100%"
                    width="100%"
                  />
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Kolom kanan */}
          <motion.div 
            className="md:w-1/2"
            variants={animations.staggerContainer}
          >
            <motion.div 
              className="mb-8"
              variants={animations.scaleIn}
            >
              <h3 className="text-5xl sm:text-6xl font-bold mb-5">{formatToRupiah(1720000000)}</h3>
              <p className="text-md text-muted-foreground">Total Pendapatan</p>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-6 sm:gap-8">
              <StatItem value={`${totalBranches}+`} label="Cabang Tersedia" />
              <StatItem value="100%" label="Terpercaya" />
              <StatItem value={`${totalFields}+`} label="Lapangan Tersedia" />
              <StatItem value="~100+" label="Pengguna Aktif" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
} 