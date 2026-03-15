"use client";

import clsx from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";

// Variantes visuais disponíveis para o botão base da interface.
type ButtonVariant = "primary" | "secondary" | "ghost";

/**
 * Props do botão compartilhado da camada de apresentação.
 */
interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
  variant?: ButtonVariant;
}

/**
 * Botão base reutilizado pela UI.
 * Encapsula estilos e mantém a API próxima de um botão nativo.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        className={clsx("button", `button--${variant}`, className)}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
