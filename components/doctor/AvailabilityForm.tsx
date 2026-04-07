'use client';

import { useForm, type ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { availabilitySchema, AvailabilityInput } from '@/schemas/doctor.schema';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Clock, Calendar, Check, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ApiResponse } from '@/types';

interface AvailabilityFormProps {
  dayOfWeek: number;
  initialData?: AvailabilityInput;
  onSuccess?: () => void;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityForm({ dayOfWeek, initialData, onSuccess }: AvailabilityFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<AvailabilityInput>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: initialData || {
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      isActive: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: AvailabilityInput) => {
      const { data } = await axios.post<ApiResponse<any>>('/api/doctors/availability', values);
      if (!data.success) throw new Error(data.error || 'Failed to update schedule');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (values: AvailabilityInput) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{dayNames[dayOfWeek]}</h3>
              <p className="text-xs text-slate-400 font-medium">Weekly Schedule</p>
            </div>
          </div>
          <FormField<AvailabilityInput, 'isActive'>
            control={form.control}
            name="isActive"
            render={({ field }: { field: ControllerRenderProps<AvailabilityInput, 'isActive'> }) => (
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormLabel className="text-sm font-bold text-slate-600">Active</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-primary-600"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField<AvailabilityInput, 'startTime'>
            control={form.control}
            name="startTime"
            render={({ field }: { field: ControllerRenderProps<AvailabilityInput, 'startTime'> }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Start Time</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                    <Input {...field} type="time" className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField<AvailabilityInput, 'endTime'>
            control={form.control}
            name="endTime"
            render={({ field }: { field: ControllerRenderProps<AvailabilityInput, 'endTime'> }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">End Time</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-600 transition-colors" />
                    <Input {...field} type="time" className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField<AvailabilityInput, 'slotDuration'>
            control={form.control}
            name="slotDuration"
            render={({ field }: { field: ControllerRenderProps<AvailabilityInput, 'slotDuration'> }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Slot Duration (Min)</FormLabel>
                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white">
                      <SelectValue placeholder="30 min" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl shadow-xl">
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="20">20 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4 gap-3">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-xl px-8 font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25 transition-all active:scale-95"
          >
            {mutation.isPending ? 'Saving...' : 'Save Schedule'}
          </Button>
        </div>

        {mutation.isError && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-semibold">{mutation.error.message}</p>
          </div>
        )}

        {mutation.isSuccess && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100 animate-fade-in">
            <Check className="w-5 h-5 flex-shrink-0" />
            <p className="text-xs font-semibold">Changes saved successfully!</p>
          </div>
        )}
      </form>
    </Form>
  );
}
