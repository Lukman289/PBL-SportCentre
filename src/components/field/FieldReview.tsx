'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Star, StarHalf } from 'lucide-react';
import { FieldReview } from '@/types';
import { fieldApi } from '@/api/field.api';
import { Card, CardContent } from '@/components/ui/card';
import { id } from 'date-fns/locale';
import AddFieldReview from './AddFieldReview';
import useToastHandler from '@/hooks/useToastHandler';

export default function FieldReviewsClient({ fieldId }: { fieldId: number }) {
  const [reviews, setReviews] = useState<FieldReview[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToastHandler();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fieldApi.getFieldReviews(fieldId);
      setReviews(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showError(error, "Gagal mengambil data ulasan");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fieldId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} fill="currentColor" size={18} className="text-yellow-500" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" fill="currentColor" size={18} className="text-yellow-500" />);
    }

    while (stars.length < 5) {
      stars.push(<Star key={`empty-${stars.length}`} fill="none" size={18} className="text-gray-300" />);
    }

    return stars;
  };

  return (
    <div className="space-y-4">
      <AddFieldReview fieldId={fieldId} onReviewAdded={fetchReviews} />
      
      {reviews.length === 0 ? (
        <p className="text-center text-gray-500 py-6">Belum ada ulasan</p>
      ) : (
        reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <div className="flex mr-2">{renderStars(review.rating)}</div>
                <span className="text-sm text-gray-600">
                  {format(new Date(review.createdAt), 'dd MMM yyyy', { locale: id })}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-1">{review.user?.name || 'Pengguna'}</h3>
              {review.review && <p className="text-gray-700">{review.review}</p>}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
} 