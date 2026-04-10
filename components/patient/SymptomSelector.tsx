'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  X, 
  Thermometer, 
  Activity, 
  Zap, 
  Wind, 
  AlertCircle,
  Dna,
  Heart,
  Brain,
  Bone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface SymptomSelectorProps {
  specialization: string;
  onChange: (formattedReason: string) => void;
}

const SYMPTOM_MAP: Record<string, { label: string; icon: any }[]> = {
  'General Physician': [
    { label: 'Fever', icon: Thermometer },
    { label: 'Cough', icon: Wind },
    { label: 'Body Ache', icon: Activity },
    { label: 'Fatigue', icon: Zap },
    { label: 'Headache', icon: Brain },
  ],
  'Cardiology': [
    { label: 'Chest Pain', icon: Heart },
    { label: 'Palpitations', icon: Activity },
    { label: 'Shortness of Breath', icon: Wind },
    { label: 'Dizziness', icon: Brain },
  ],
  'Orthopedic': [
    { label: 'Joint Pain', icon: Bone },
    { label: 'Swelling', icon: Activity },
    { label: 'Back Pain', icon: AlertCircle },
    { label: 'Stiffness', icon: Zap },
  ],
  'Neurology': [
    { label: 'Numbness', icon: Zap },
    { label: 'Seizures', icon: Brain },
    { label: 'Migraine', icon: AlertCircle },
    { label: 'Tremors', icon: Activity },
  ],
  'default': [
    { label: 'Pain', icon: AlertCircle },
    { label: 'Fever', icon: Thermometer },
    { label: 'Infection', icon: Activity },
    { label: 'General Checkup', icon: Dna },
  ]
};

export default function SymptomSelector({ specialization, onChange }: SymptomSelectorProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState([5]);
  const [isChronic, setIsChronic] = useState(false);

  const availableSymptoms = SYMPTOM_MAP[specialization] || SYMPTOM_MAP.default;

  const toggleSymptom = (label: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  useEffect(() => {
    const symptomsStr = selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'General consultation';
    const chronicStr = isChronic ? ' (Chronic condition)' : '';
    const formatted = `[Severity: ${severity[0]}/10] Symptoms: ${symptomsStr}.${chronicStr}`;
    onChange(formatted);
  }, [selectedSymptoms, severity, isChronic]);

  return (
    <div className="space-y-8 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
      {/* Symptom Tags */}
      <div className="space-y-4">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">
          Select Symptoms
        </label>
        <div className="flex flex-wrap gap-3">
          {availableSymptoms.map((s) => {
            const Icon = s.icon;
            const isSelected = selectedSymptoms.includes(s.label);
            return (
              <button
                key={s.label}
                onClick={() => toggleSymptom(s.label)}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 border",
                  isSelected 
                    ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/25 -translate-y-1" 
                    : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:border-slate-200"
                )}
              >
                <Icon className={cn("w-4 h-4", isSelected ? "text-white" : "text-primary-600")} />
                {s.label}
                {isSelected ? <X className="w-3.5 h-3.5 ml-1 opacity-60" /> : <Plus className="w-3.5 h-3.5 ml-1 opacity-40" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Severity Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">
            Severity Level
          </label>
          <Badge className={cn(
            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border-none text-white",
            severity[0] < 4 ? "bg-emerald-500" : severity[0] < 8 ? "bg-amber-500" : "bg-red-500"
          )}>
            Level {severity[0]}
          </Badge>
        </div>
        <div className="px-2 pt-2">
           <Slider
              value={severity}
              onValueChange={setSeverity}
              max={10}
              min={1}
              step={1}
              className="py-4"
           />
           <div className="flex justify-between mt-2">
              <span className="text-[10px] font-bold text-slate-300 uppercase">Mild</span>
              <span className="text-[10px] font-bold text-slate-300 uppercase">Moderate</span>
              <span className="text-[10px] font-bold text-slate-300 uppercase">Severe</span>
           </div>
        </div>
      </div>

      {/* Chronic Toggle */}
      <div className="pt-2">
         <button 
            onClick={() => setIsChronic(!isChronic)}
            className={cn(
               "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
               isChronic ? "bg-primary-50 border-primary-100 text-primary-700" : "bg-slate-50 border-slate-100 text-slate-400 opacity-60 hover:opacity-100"
            )}
         >
            <div className="flex items-center gap-3">
               <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", isChronic ? "bg-primary-100" : "bg-slate-100")}>
                  <AlertCircle className="w-4 h-4" />
               </div>
               <span className="text-sm font-bold">This is a chronic/pre-existing condition</span>
            </div>
            <div className={cn(
               "w-10 h-5 rounded-full relative transition-colors",
               isChronic ? "bg-primary-500" : "bg-slate-200"
            )}>
               <div className={cn(
                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                  isChronic ? "left-6" : "left-1"
               )} />
            </div>
         </button>
      </div>

      {/* Preview Brief */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
         <p className="text-[9px] font-black text-primary-400 uppercase tracking-[0.2em] mb-2">Digital Intake Brief</p>
         <p className="text-xs font-medium text-slate-300 leading-relaxed truncate">
            {severity[0]} severity • {selectedSymptoms.length > 0 ? selectedSymptoms.join(', ') : 'General Symptoms'} {isChronic ? '• Chronic' : ''}
         </p>
      </div>
    </div>
  );
}
