import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onChange,
  readOnly = true,
  size = 'md',
  showLabel = false
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const labels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  const currentDisplay = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => !readOnly && setHoverRating(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= currentDisplay;
          return (
            <button
              key={star}
              type="button"
              disabled={readOnly}
              onMouseEnter={() => !readOnly && setHoverRating(star)}
              onClick={() => !readOnly && onChange?.(star)}
              className={`${
                readOnly
                  ? 'cursor-default'
                  : 'cursor-pointer hover:scale-120 active:scale-95 transition-transform p-0.5'
              } focus:outline-none`}
              title={!readOnly ? `${star} - ${labels[star]}` : `${rating} Stars`}
            >
              <Star
                className={`${starSizes[size]} transition-colors duration-150 ${
                  isFilled
                    ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                    : 'fill-stone-100 text-stone-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && currentDisplay > 0 && (
        <span className="text-xs font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 animate-fadeIn">
          {labels[currentDisplay] || `${currentDisplay}/5`}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
