'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Stethoscope, IndianRupee, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface FiltersProps {
  onFilterChange: (filters: any) => void;
  isLoading?: boolean;
}

const specializations = [
  'General Medicine', 'Cardiology', 'Dermatology', 'Neurology', 
  'Pediatrics', 'Orthopedics', 'Dentistry', 'Gynecology', 'Psychiatry'
];

const cities = ['New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad'];

export default function DoctorSearchFilters({ onFilterChange, isLoading }: FiltersProps) {
  const [filters, setFilters] = useState({
    name: '',
    specialization: 'all',
    city: 'all',
    minFee: '',
    maxFee: '',
  });

  const handleClear = () => {
    const cleared = { name: '', specialization: 'all', city: 'all', minFee: '', maxFee: '' };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const handleChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Debounce name search? For now, we'll let the parent handle it or provide a search button.
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary-600" />
          Filter Doctors
        </h2>
        <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 h-8">
          <X className="w-3 h-3 mr-1" /> Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Search Name</label>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <Input
              placeholder="e.g. Dr. Sharma"
              value={filters.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Specialization</label>
          <Select value={filters.specialization} onValueChange={(val) => handleChange('specialization', val)}>
            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:ring-primary-500/20">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-slate-400" />
                <SelectValue placeholder="All Specialities" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="all">All Specialities</SelectItem>
              {specializations.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Location</label>
          <Select value={filters.city} onValueChange={(val) => handleChange('city', val)}>
            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50 focus:ring-primary-500/20">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <SelectValue placeholder="All Cities" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Consultation Fee</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Min"
                type="number"
                value={filters.minFee}
                onChange={(e) => handleChange('minFee', e.target.value)}
                className="pl-8 h-11 rounded-xl border-slate-200 bg-slate-50 text-xs"
              />
            </div>
            <div className="relative flex-1">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Max"
                type="number"
                value={filters.maxFee}
                onChange={(e) => handleChange('maxFee', e.target.value)}
                className="pl-8 h-11 rounded-xl border-slate-200 bg-slate-50 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end pt-4 gap-3">
        <Button 
          onClick={handleApply} 
          disabled={isLoading}
          className="w-full sm:w-auto rounded-xl px-12 font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/25 transition-all active:scale-95 h-12"
        >
          {isLoading ? 'Searching...' : 'Search Doctors'}
        </Button>
      </div>
    </div>
  );
}
