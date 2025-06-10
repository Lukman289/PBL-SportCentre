"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PaymentStatus, Payment } from "@/types";
import { StepItem, Steps } from "./steps";

interface PaymentFlowProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: PaymentStatus;
  orientation?: "vertical" | "horizontal";
  payments?: Payment[];
  totalPaid?: number;
  totalPrice?: number;
}

export function PaymentFlow({
  status,
  orientation = "vertical",
  payments = [],
  totalPaid = 0,
  totalPrice = 0,
  className,
  ...props
}: PaymentFlowProps) {
  // Tentukan status berdasarkan total pembayaran jika tersedia
  const isFullyPaid = totalPrice > 0 && totalPaid >= totalPrice;
  
  // Cek apakah ada pembayaran dengan status PAID
  const hasPaidPayment = payments.some(p => p.status === PaymentStatus.PAID);
  
  // Cek apakah ada pembayaran dengan status DP_PAID
  const hasDpPaidPayment = payments.some(p => p.status === PaymentStatus.DP_PAID);
  
  // Tentukan status yang akan digunakan
  const effectiveStatus = isFullyPaid ? PaymentStatus.PAID : status;

  const steps = React.useMemo(() => {
    const items: StepItem[] = [
      {
        title: "Menunggu Pembayaran",
        description: "Menunggu pembayaran DP",
        status: effectiveStatus === PaymentStatus.PENDING ? "current" : 
               (effectiveStatus === PaymentStatus.DP_PAID || effectiveStatus === PaymentStatus.PAID || hasDpPaidPayment || isFullyPaid) ? "complete" : 
               effectiveStatus === PaymentStatus.FAILED ? "complete" : "upcoming"
      },
      {
        title: "DP Terbayar",
        description: "Pembayaran uang muka berhasil",
        status: (effectiveStatus === PaymentStatus.DP_PAID && !isFullyPaid) ? "current" : 
               (effectiveStatus === PaymentStatus.PAID || isFullyPaid || hasPaidPayment) ? "complete" : "upcoming"
      },
      {
        title: "Lunas",
        description: "Pembayaran pelunasan berhasil",
        status: (effectiveStatus === PaymentStatus.PAID || isFullyPaid || hasPaidPayment) ? "current" : "upcoming"
      }
    ];

    // Jika status FAILED, tampilkan pesan gagal
    if (effectiveStatus === PaymentStatus.FAILED) {
      return [
        items[0],
        {
          title: "Pembayaran Gagal",
          description: "Pembayaran tidak berhasil",
          status: "current" as const
        }
      ] as StepItem[];
    }
    
    // Jika status REFUNDED, tampilkan alur refund
    if (effectiveStatus === PaymentStatus.REFUNDED) {
      return [
        {
          ...items[0],
          status: "complete" as const
        },
        {
          title: "Dana Dikembalikan",
          description: "Pembayaran telah dikembalikan",
          status: "current" as const
        }
      ] as StepItem[];
    }

    return items;
  }, [effectiveStatus, isFullyPaid, hasPaidPayment, hasDpPaidPayment]);

  return (
    <div className={cn("my-4", className)} {...props}>
      <Steps items={steps} orientation={orientation} />
    </div>
  );
}