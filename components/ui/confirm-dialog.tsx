import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#0a0a0a] border-[#333333] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white">{title}</CardTitle>
          <CardDescription className="text-[#a1a1a1] mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={() => {
              onConfirm();
              onCancel(); // Close dialog after confirming usually, but allow caller to handle if needed
            }}
          >
            {confirmText}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
