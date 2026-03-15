"use client";

import * as Progress from "@radix-ui/react-progress";
import clsx from "clsx";

/**
 * Props da barra de progresso da jornada do hóspede.
 */
interface ProgressRailProps {
  currentStep: number;
  steps: string[];
}

/**
 * Representa visualmente o avanço do hóspede nas etapas do autoatendimento.
 */
export const ProgressRail = ({ currentStep, steps }: ProgressRailProps) => {
  const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="progress-rail">
      <div className="progress-rail__header">
        <span className="eyebrow">Jornada do hóspede</span>
        <strong>{steps[currentStep]}</strong>
      </div>

      <Progress.Root className="progress-rail__track" value={progressValue}>
        <Progress.Indicator
          className="progress-rail__indicator"
          style={{ transform: `translateX(-${100 - progressValue}%)` }}
        />
      </Progress.Root>

      <div className="progress-rail__steps">
        {steps.map((step, index) => (
          <div
            className={clsx("progress-rail__step", {
              "progress-rail__step--active": index === currentStep,
              "progress-rail__step--done": index < currentStep,
            })}
            key={step}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <small>{step}</small>
          </div>
        ))}
      </div>
    </div>
  );
};
