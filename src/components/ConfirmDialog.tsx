import Modal from "./Modal";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  pending: boolean;
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
  pending,
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      eyebrow="Please confirm"
      onClose={onClose}
      size="small"
    >
      <p className="m-0 text-sm leading-6 text-slate-600">{message}</p>

      <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
          onClick={onClose}
        >
          Cancel
        </button>

        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border border-red-700 bg-red-700 px-4 text-xs font-bold text-white"
          onClick={onConfirm}
          disabled={pending}
        >
          {pending ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
