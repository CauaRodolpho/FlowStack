import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useRef, useState } from "react";

export function useConfirmation() {
  const [message, setMessage] = useState<string | null>(null);
  const pending = useRef<((value: boolean) => void) | null>(null);
  useEffect(() => () => pending.current?.(false), []);
  function answer(value: boolean) {
    pending.current?.(value);
    pending.current = null;
    setMessage(null);
  }
  function confirm(text: string) {
    pending.current?.(false);
    setMessage(text);
    return new Promise<boolean>((resolve) => {
      pending.current = resolve;
    });
  }
  const confirmation = (
    <AlertDialog
      open={message !== null}
      onOpenChange={(open) => {
        if (!open) answer(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar alteração</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => answer(false)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => answer(true)}>
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  return { confirm, confirmation };
}
