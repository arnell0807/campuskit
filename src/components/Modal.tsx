import type { ReactNode } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";

type ModalProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  onClose: () => void;
  size?: "small" | "medium";
};

export default function Modal({
  title,
  eyebrow,
  children,
  onClose,
  size = "medium",
}: ModalProps) {
  useEffect(() => {
    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", closeOnEscape);
    document.body.classList.add("modal-open");

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.classList.remove("modal-open");
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-modal grid place-items-center bg-campus-900/60 p-5 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        className={`max-h-[calc(100vh-40px)] w-full overflow-auto rounded-2xl border border-white/50 bg-white shadow-2xl ${
          size === "small" ? "max-w-md" : "max-w-2xl"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            {eyebrow && (
              <span className="mb-1 block text-xs font-extrabold uppercase tracking-widest text-campus-600">
                {eyebrow}
              </span>
            )}

            <h2 className="m-0 text-lg font-extrabold" id="modal-title">
              {title}
            </h2>
          </div>

          <button
            type="button"
            className="inline-grid size-9 place-items-center rounded-lg border-0 bg-transparent p-0 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </header>

        <div className="p-6">{children}</div>
      </section>
    </div>
  );
}
