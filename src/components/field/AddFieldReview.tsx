'use client';

import { useState } from 'react';
import { Star, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fieldApi } from '@/api/field.api';
import { useToast } from '@/components/ui/use-toast';
import useAuth from '@/hooks/useAuth.hook';
import { Role } from '@/types';

interface ErrorResponse {
  status: boolean;
  message: string;
}

interface ApiError {
  response?: {
    data?: unknown;
  };
}

export default function AddFieldReview({ fieldId, onReviewAdded }: { fieldId: number; onReviewAdded: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  if (!user || user.role !== Role.USER) {
    return null;
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating diperlukan',
        description: 'Silakan berikan rating untuk lapangan ini',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await fieldApi.createFieldReview(fieldId, {
        rating,
        review: review.trim() || undefined,
      });
      
      toast({
        title: 'Ulasan berhasil ditambahkan',
        description: 'Terima kasih atas ulasan Anda',
        variant: 'default',
        className: 'bg-green-50 border-green-200',
      });
      
      // Reset form
      setRating(0);
      setReview('');
      
      // Reload reviews
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (error: unknown) {
      
      // Menangani error dari backend
      let errorMessage = 'Terjadi kesalahan saat menambahkan ulasan';
      
      // Cek apakah ada response dari server
      const apiError = error as ApiError;
      if (apiError?.response?.data) {
        const errorData = apiError.response.data as ErrorResponse;
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      
      toast({
        title: 'Gagal menambahkan ulasan',
        description: errorMessage,
        variant: 'destructive',
        className: 'border-red-200',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
      <h3 className="text-lg font-semibold mb-3">Tambahkan Ulasan</h3>
      
      <div className="flex items-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={24}
            className={`cursor-pointer transition-all ${
              star <= (hoverRating || rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating} dari 5 bintang` : 'Pilih rating'}
        </span>
      </div>
      
      <Textarea
        placeholder="Bagikan pengalaman Anda tentang lapangan ini (opsional)"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        className="mb-4 resize-none focus:ring-2 focus:ring-primary/20"
        rows={4}
      />
      
      <div className="text-sm text-amber-600 mb-3 flex items-center">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <span>Anda harus pernah booking lapangan ini untuk memberikan ulasan</span>
      </div>
      
      <Button 
        onClick={handleSubmit} 
        disabled={isSubmitting || rating === 0}
        className="w-full bg-primary hover:bg-primary/90 transition-all"
      >
        {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
      </Button>
    </div>
  );
} 