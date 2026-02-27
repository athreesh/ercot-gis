import { useState, type ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function FilterSection({ title, children, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-bp-border pb-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-1 text-left text-[10px] font-semibold uppercase tracking-wider text-bp-muted hover:text-bp-dark"
      >
        {title}
        <svg
          className={`h-3.5 w-3.5 transform transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}
