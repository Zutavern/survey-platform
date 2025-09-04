'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  variant?: 'destructive' | 'warning'
  itemName?: string
  itemCount?: number
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = 'Löschen',
  cancelText = 'Abbrechen',
  isLoading = false,
  variant = 'destructive',
  itemName,
  itemCount
}: DeleteConfirmationDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm()
    } catch (error) {
      console.error('Delete confirmation error:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-sm border-slate-200/50">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              variant === 'destructive' ? 'bg-red-100' : 'bg-orange-100'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${
                variant === 'destructive' ? 'text-red-600' : 'text-orange-600'
              }`} />
            </div>
            <div>
              <DialogTitle className="text-left text-slate-900">
                {title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <DialogDescription className="text-slate-600 text-left leading-relaxed">
            {description}
          </DialogDescription>
          
          {itemName && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm font-medium text-slate-900">
                {itemCount && itemCount > 1 ? (
                  `${itemCount} Elemente werden gelöscht`
                ) : (
                  `Zu löschendes Element: ${itemName}`
                )}
              </p>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              <strong>Achtung:</strong> Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Lösche...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}