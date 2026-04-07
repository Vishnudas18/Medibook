'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { SlotPickerProps, TimeSlot } from '@/types';
import { useSlots } from '@/hooks/useSlots';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { Calendar as ShadcnCalendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, isBefore, startOfToday } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function SlotPicker({
  doctorId,
  selectedDate,
  onDateChange,
  onSlotSelect,
  selectedSlot,
}: SlotPickerProps) {
  const { data: slots, isLoading, isError, error } = useSlots(doctorId, selectedDate);

  const disabledDates = {
    before: startOfToday(),
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-in">
      {/* Calendar Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4 text-primary-600" />
          </div>
          <h3 className="font-bold text-slate-900">Select Date</h3>
        </div>
        <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm overflow-hidden flex justify-center">
          <ShadcnCalendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            disabled={disabledDates}
            className="rounded-md border-none"
          />
        </div>
      </div>

      {/* Slots Section */}
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary-600" />
          </div>
          <h3 className="font-bold text-slate-900">Available Slots</h3>
        </div>

        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[300px]">
          {!selectedDate ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-10 opacity-60">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium max-w-[200px]">
                Please select a date to view available time slots
              </p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-3 gap-3">
              {[...Array(9)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-10">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-semibold">{error?.message || 'Error loading slots'}</p>
            </div>
          ) : slots && slots.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.startTime === slot.startTime;
                return (
                  <Button
                    key={slot.startTime}
                    variant="outline"
                    onClick={() => onSlotSelect(slot)}
                    className={cn(
                      'px-4 h-12 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 flex-grow sm:flex-grow-0',
                      isSelected
                        ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-slate-50 border-slate-100 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700'
                    )}
                  >
                    {slot.startTime}
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-10">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-slate-500 font-medium">
                No slots available on <span className="font-bold text-slate-800">{format(selectedDate, 'PPP')}</span>
              </p>
              <p className="text-xs text-slate-400">Please try another date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
