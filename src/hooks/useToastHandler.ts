import { toast } from "sonner";

type ErrorResponse = {
  response?: {
    data?: {
      message?: string;
      error?: string;
      errors?: string[];
    };
    status?: number;
  };
  message?: string;
};

/**
 * Hook untuk mengelola toast notification (error & sukses) dengan Sonner
 */
const useToastHandler = () => {
  /**
   * Menampilkan pesan error dengan toast
   * @param error Error yang akan ditampilkan (bisa berupa string, Error, atau object API error)
   * @param defaultMessage Pesan default jika error tidak memiliki pesan
   */
  const showError = (error: unknown, defaultMessage = "Terjadi kesalahan") => {
    let title = "Error";
    let description = defaultMessage;

    // Jika error adalah string
    if (typeof error === "string") {
      description = error;
    }
    // Jika error adalah Error object
    else if (error instanceof Error) {
      description = error.message || defaultMessage;
    }
    // Jika error adalah API error (dengan format response)
    else if (typeof error === "object" && error !== null) {
      const apiError = error as ErrorResponse;
      
      // Coba ambil pesan dari berbagai kemungkinan lokasi dalam respons API
      if (apiError.response?.data?.message) {
        description = apiError.response.data.message;
      } else if (apiError.response?.data?.error) {
        description = apiError.response.data.error;
      } else if (apiError.response?.data?.errors?.length) {
        description = apiError.response.data.errors.join(", ");
      } else if (apiError.message) {
        description = apiError.message;
      }

      // Set judul berdasarkan status HTTP jika tersedia
      if (apiError.response?.status) {
        if (apiError.response.status === 401) {
          title = "Tidak Memiliki Akses";
        } else if (apiError.response.status === 403) {
          title = "Akses Ditolak";
        } else if (apiError.response.status === 404) {
          title = "Tidak Ditemukan";
        } else if (apiError.response.status >= 500) {
          title = "Kesalahan Server";
        }
      }
    }

    // Tampilkan toast error dengan Sonner
    toast.error(title, {
      description,
      duration: 5000
    });
  };

  /**
   * Menampilkan pesan sukses dengan toast
   * @param message Pesan sukses yang akan ditampilkan
   * @param title Judul toast (default: "Sukses")
   */
  const showSuccess = (message: string, title = "Sukses") => {
    toast.success(title, {
      description: message,
      duration: 3000
    });
  };

  /**
   * Menampilkan toast informasi dengan Sonner
   * @param message Pesan info yang akan ditampilkan
   * @param title Judul toast (default: "Info")
   */
  const showInfo = (message: string, title = "Info") => {
    toast.info(title, {
      description: message,
      duration: 3000
    });
  };
  
  /**
   * Menampilkan toast warning dengan Sonner
   * @param message Pesan warning yang akan ditampilkan
   * @param title Judul toast (default: "Peringatan")
   */
  const showWarning = (message: string, title = "Peringatan") => {
    toast.warning(title, {
      description: message,
      duration: 4000
    });
  };

  /**
   * Menampilkan toast custom dengan Sonner
   * @param title Judul toast
   * @param options Opsi toast yang akan ditampilkan
   */
  const showToast = (title: string, options?: any) => {
    toast(title, options);
  };

  return { 
    showError, 
    showSuccess,
    showInfo,
    showWarning,
    showToast
  };
};

export default useToastHandler;
