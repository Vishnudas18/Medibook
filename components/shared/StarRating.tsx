import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export default function StarRating({ 
  rating, 
  max = 5, 
  size = 18, 
  onRatingChange,
  className = "" 
}: StarRatingProps) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;
        
        return (
          <Star
            key={i}
            size={size}
            className={`
              transition-all duration-200
              ${onRatingChange ? 'cursor-pointer hover:scale-110 active:scale-95' : ''}
              ${isFilled ? 'fill-amber-400 text-amber-500' : 'text-slate-200'}
            `}
            onClick={() => {
              if (onRatingChange) {
                onRatingChange(starValue);
              }
            }}
          />
        );
      })}
    </div>
  );
}
