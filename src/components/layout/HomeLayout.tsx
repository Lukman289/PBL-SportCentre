import { ReactNode } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { useMobile } from '@/context/mobile/MobileContext';

interface HomeLayoutProps {
  children: ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
  const { isMobile, showBottomNav } = useMobile();

  return (
    <ResponsiveLayout 
      showBottomNav={true}
      customLayout={true}
    >
      <div className="flex flex-col w-full min-h-screen relative overflow-hidden">
        {/* Elemen dekoratif - lingkaran besar di pojok kanan atas dengan animasi */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/3 blur-3xl animate-pulse-slow" />
        
        {/* Elemen dekoratif - lingkaran kecil di pojok kiri bawah dengan animasi */}
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-primary/10 -translate-x-1/3 translate-y-1/4 blur-2xl animate-float" />
        
        {/* Elemen dekoratif - bentuk gelombang di tengah */}
        <div className="absolute top-1/2 left-0 w-full h-[500px] bg-gradient-to-r from-primary/[0.03] via-primary/[0.05] to-transparent -skew-y-6 -z-10" />
        
        <Header />
        
        <main className={`flex-1 w-full m-0 justify-center items-center pt-0 py-8 relative z-10 ${isMobile && showBottomNav ? 'pb-16' : ''}`}>
          {children}
        </main>
        
        {/* Elemen dekoratif - pola titik-titik dengan animasi */}
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] opacity-20 pointer-events-none animate-twinkle">
          <div className="absolute w-2 h-2 rounded-full bg-primary top-0 left-0"></div>
          <div className="absolute w-2 h-2 rounded-full bg-primary top-10 left-10 animate-delay-100"></div>
          <div className="absolute w-2 h-2 rounded-full bg-primary top-20 left-20 animate-delay-200"></div>
          <div className="absolute w-2 h-2 rounded-full bg-primary top-30 left-30 animate-delay-300"></div>
          <div className="absolute w-2 h-2 rounded-full bg-primary top-40 left-40 animate-delay-400"></div>
          <div className="absolute w-2 h-2 rounded-full bg-primary top-0 left-20 animate-delay-500"></div>
          <div className="absolute w-2 h-2 rounded-full bg-primary top-20 left-0 animate-delay-600"></div>
          <div className="absolute w-2 h-2 rounded-full bg-primary top-10 left-30 animate-delay-700"></div>
          <div className="absolute w-2 h-2 rounded-full bg-primary top-30 left-10 animate-delay-800"></div>
          <div className="absolute w-2 h-2 rounded-full bg-primary top-40 left-20 animate-delay-900"></div>
        </div>
        
        {/* Elemen dekoratif - garis diagonal */}
        <div className="absolute top-1/4 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent transform rotate-[30deg] -z-10" />
        <div className="absolute top-3/4 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/10 to-transparent transform -rotate-[30deg] -z-10" />
        
        <Footer />
        
        <style jsx global>{`
          @keyframes float {
            0% { transform: translate(-33%, 25%) rotate(0deg); }
            50% { transform: translate(-33%, 22%) rotate(5deg); }
            100% { transform: translate(-33%, 25%) rotate(0deg); }
          }
          
          @keyframes pulse-slow {
            0% { opacity: 0.4; }
            50% { opacity: 0.6; }
            100% { opacity: 0.4; }
          }
          
          @keyframes twinkle {
            0% { opacity: 0.1; }
            50% { opacity: 0.3; }
            100% { opacity: 0.1; }
          }
          
          .animate-float {
            animation: float 10s ease-in-out infinite;
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 8s ease-in-out infinite;
          }
          
          .animate-twinkle {
            animation: twinkle 4s ease-in-out infinite;
          }
          
          .animate-delay-100 { animation-delay: 0.1s; }
          .animate-delay-200 { animation-delay: 0.2s; }
          .animate-delay-300 { animation-delay: 0.3s; }
          .animate-delay-400 { animation-delay: 0.4s; }
          .animate-delay-500 { animation-delay: 0.5s; }
          .animate-delay-600 { animation-delay: 0.6s; }
          .animate-delay-700 { animation-delay: 0.7s; }
          .animate-delay-800 { animation-delay: 0.8s; }
          .animate-delay-900 { animation-delay: 0.9s; }
        `}</style>
      </div>
    </ResponsiveLayout>
  );
} 