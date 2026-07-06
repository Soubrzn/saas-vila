"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type SubmitButtonProps = ComponentProps<typeof Button> & {
  pendingLabel?: string;
};

export function SubmitButton({
  children,
  disabled,
  pendingLabel,
  type = "submit",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <Button
      {...props}
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
