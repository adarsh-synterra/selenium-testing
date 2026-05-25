export default function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number; // 1-indexed
}) {
  return (
    <ol
      data-testid="checkout-stepper"
      className="mb-8 flex items-center gap-4 text-sm"
    >
      {steps.map((label, idx) => {
        const num = idx + 1;
        const active = num === current;
        const done = num < current;
        return (
          <li
            key={label}
            data-testid={`stepper-step-${num}`}
            data-active={active}
            data-done={done}
            className="flex items-center gap-2"
          >
            <span
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                active
                  ? "border-slate-900 bg-slate-900 text-white"
                  : done
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 bg-white text-slate-500",
              ].join(" ")}
            >
              {num}
            </span>
            <span className={active ? "font-medium" : "text-slate-500"}>
              {label}
            </span>
            {num < steps.length && <span className="text-slate-300">/</span>}
          </li>
        );
      })}
    </ol>
  );
}
