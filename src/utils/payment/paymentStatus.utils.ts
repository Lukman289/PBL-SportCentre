import { PaymentStatus, Payment } from "@/types/booking.types";

/**
 * Mendapatkan teks status pembayaran yang sesuai
 * @param status Status pembayaran
 * @returns Teks status pembayaran
 */
export const getPaymentStatusText = (status?: PaymentStatus | string): string => {
  switch (status) {
    case PaymentStatus.PAID:
      return "Lunas";
    case PaymentStatus.DP_PAID:
      return "DP Terbayar";
    case PaymentStatus.PENDING:
      return "Menunggu Pembayaran";
    case PaymentStatus.FAILED:
      return "Pembayaran Gagal";
    case PaymentStatus.REFUNDED:
      return "Dana Dikembalikan";
    default:
      return "Tidak Diketahui";
  }
};

/**
 * Mendapatkan warna untuk status pembayaran
 * @param status Status pembayaran
 * @returns Kelas CSS untuk warna status
 */
export const getPaymentStatusColor = (status?: PaymentStatus): string => {
  switch (status) {
    case PaymentStatus.PAID:
      return "bg-green-500 hover:bg-green-600";
    case PaymentStatus.DP_PAID:
      return "bg-blue-500 hover:bg-blue-600";
    case PaymentStatus.PENDING:
      return "bg-yellow-500 hover:bg-yellow-600";
    case PaymentStatus.FAILED:
      return "bg-red-500 hover:bg-red-600";
    case PaymentStatus.REFUNDED:
      return "bg-gray-500 hover:bg-gray-600";
    default:
      return "bg-gray-500 hover:bg-gray-600";
  }
};

/**
 * Menentukan status pembayaran berdasarkan total pembayaran
 * @param status Status pembayaran saat ini
 * @param payments Array pembayaran
 * @param totalPrice Total harga
 * @returns Status pembayaran yang sebenarnya
 */
export const determinePaymentStatus = (
  status?: PaymentStatus,
  payments?: Payment[],
  totalPrice?: number
): PaymentStatus => {
  // Jika tidak ada status, kembalikan status tidak diketahui
  if (!status) return PaymentStatus.PENDING;
  
  // Jika ada data payments dan totalPrice, periksa apakah sudah lunas
  if (payments && payments.length > 0 && totalPrice) {
    // Hitung total pembayaran yang sudah dibayar (DP_PAID atau PAID)
    const totalPaid = payments.reduce(
      (sum, p) =>
        p.status === PaymentStatus.PAID || p.status === PaymentStatus.DP_PAID
          ? sum + (p.amount || 0)
          : sum,
      0
    );

    // Jika total pembayaran sudah mencukupi total harga, anggap lunas
    if (totalPaid >= totalPrice) {
      return PaymentStatus.PAID;
    }
  }

  // Jika tidak ada data tambahan atau belum lunas, gunakan status asli
  return status;
}; 