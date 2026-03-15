"use client";

import * as Label from "@radix-ui/react-label";
import { InputHTMLAttributes } from "react";

/**
 * Props do campo de texto compartilhado da interface.
 */
interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
}

/**
 * Campo de entrada com label acessível e hint opcional.
 */
export const TextField = ({ id, label, hint, ...props }: TextFieldProps) => {
  return (
    <label className="field">
      <div className="field__header">
        <Label.Root className="field__label" htmlFor={id}>
          {label}
        </Label.Root>
        {hint ? <span className="field__hint">{hint}</span> : null}
      </div>
      <input className="field__control" id={id} {...props} />
    </label>
  );
};
