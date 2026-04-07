import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse, TimeSlot } from '@/types';
import { format } from 'date-fns';

export function useSlots(doctorId: string, date: Date | undefined) {
  const dateStr = date ? format(date, 'yyyy-MM-dd') : '';

  return useQuery({
    queryKey: ['slots', doctorId, dateStr],
    queryFn: async () => {
      if (!doctorId || !dateStr) return [];
      const { data } = await axios.get<ApiResponse<TimeSlot[]>>(
        `/api/doctors/${doctorId}/slots?date=${dateStr}`
      );
      if (!data.success) throw new Error(data.error || 'Failed to fetch slots');
      return data.data || [];
    },
    enabled: !!doctorId && !!dateStr,
  });
}
