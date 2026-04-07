'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'primary';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6">
          <DialogHeader className="gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${variant === 'destructive' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'}`}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900 leading-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-sm leading-relaxed">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <DialogFooter className="bg-slate-50 px-6 py-4 mt-0 gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-xl hover:bg-white hover:text-slate-900 transition-all font-medium"
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            loading={isLoading}
            className={`rounded-xl px-6 font-semibold shadow-sm transition-all active:scale-95 ${variant === 'primary' ? 'bg-primary-600 hover:bg-primary-700 text-white' : ''}`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
