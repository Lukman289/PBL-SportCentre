// Skema warna konsisten untuk digunakan di seluruh aplikasi
export const colorScheme = {
  // Warna utama
  primary: {
    light: "from-primary/10 to-primary/5",
    medium: "from-primary/20 to-primary/10",
    strong: "from-primary/30 to-primary/20",
    gradient: "from-primary to-primary/80",
    text: "text-primary"
  },
  
  // Warna aksen
  accent: {
    green: {
      light: "from-green-500/20 to-green-500/5",
      medium: "from-green-500/30 to-green-500/20",
      text: "text-green-500"
    },
    blue: {
      light: "from-blue-500/20 to-blue-500/5",
      medium: "from-blue-500/30 to-blue-500/20",
      text: "text-blue-600"
    },
    purple: {
      light: "from-purple-500/20 to-purple-500/5",
      medium: "from-purple-500/30 to-purple-500/20",
      text: "text-purple-500"
    },
    orange: {
      light: "from-orange-500/20 to-orange-500/5",
      medium: "from-orange-500/30 to-orange-500/20",
      text: "text-orange-500"
    }
  },
  
  // Ukuran font yang konsisten
  fontSize: {
    // Mobile first
    hero: "text-2xl sm:text-4xl md:text-5xl lg:text-6xl",
    heading1: "text-xl sm:text-3xl md:text-4xl",
    heading2: "text-lg sm:text-2xl md:text-3xl",
    heading3: "text-base sm:text-xl md:text-2xl",
    subtitle: "text-sm sm:text-lg md:text-xl text-muted-foreground",
    body: "text-xs sm:text-base",
    small: "text-[10px] sm:text-xs",
    label: "text-xs sm:text-sm font-medium"
  },
  
  // Spacing yang konsisten
  spacing: {
    section: "py-8 sm:py-16 md:py-20",
    container: "px-4 sm:px-6 md:px-8",
    gap: "gap-3 sm:gap-6 md:gap-8"
  }
}; 