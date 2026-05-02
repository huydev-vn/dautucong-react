import { useState, useCallback, useMemo } from 'react';
import { FileWarning, PenLine, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function useUnsavedChanges(isDirty: boolean, onClose: () => void) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const guardedClose = useCallback(() => {
    if (isDirty) {
      setConfirmOpen(true);
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const handleDiscard = useCallback(() => {
    setConfirmOpen(false);
    onClose();
  }, [onClose]);

  const handleCancel = useCallback(() => {
    setConfirmOpen(false);
  }, []);

  const DiscardDialog = useMemo(
    () => (
      <Dialog open={confirmOpen} onOpenChange={(v) => !v && handleCancel()}>
        <DialogContent
          className="max-w-[420px] gap-0 overflow-hidden p-0"
          showCloseButton={false}
        >
          {/* Accent bar */}
          <div className="h-1 w-full bg-amber-400" />

          {/* Body */}
          <div className="px-6 pb-6 pt-5">
            {/* Icon + heading */}
            <div className="flex items-start gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-200">
                <FileWarning size={20} className="text-amber-500" />
              </div>
              <div className="pt-1">
                <DialogTitle className="text-[14px] font-semibold text-gray-900">
                  Hủy thay đổi?
                </DialogTitle>
                <DialogDescription className="mt-0.5 text-[12px] text-gray-500">
                  Dữ liệu vừa nhập sẽ bị mất nếu bạn thoát.
                </DialogDescription>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscard}
                className="gap-1.5 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut size={13} />
                Thoát
              </Button>
              <Button
                size="sm"
                onClick={handleCancel}
                className="gap-1.5 bg-[#1a3c6e] text-white hover:bg-[#0f2a52]"
              >
                <PenLine size={13} />
                Tiếp tục
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    ),
    [confirmOpen, handleDiscard, handleCancel],
  );

  return { guardedClose, DiscardDialog };
}

