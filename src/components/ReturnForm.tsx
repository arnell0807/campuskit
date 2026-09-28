import { useForm } from "react-hook-form";
import FormField from "./FormField";
import type { Equipment, Student } from "../types";
import { conditions } from "../constants";

export type ReturnFormValues = {
  condition: string;
};

type ReturnFormProps = {
  equipment: Equipment;
  student: Student;
  onSubmit: (values: ReturnFormValues) => void;
  onCancel: () => void;
  pending: boolean;
  serverError?: string;
};

export default function ReturnForm({
  equipment,
  student,
  onSubmit,
  onCancel,
  pending,
  serverError,
}: ReturnFormProps) {
  const { register, handleSubmit } = useForm<ReturnFormValues>({
    defaultValues: {
      condition: equipment.condition,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-5 rounded-lg bg-campus-50 p-4">
        <span className="mb-1 block text-xs uppercase text-slate-500">
          Returning
        </span>

        <strong className="block text-sm">{equipment.name}</strong>

        <p className="mb-0 mt-1 text-xs text-slate-500">
          Checked out to {student.name}
        </p>
      </div>

      <FormField
        label="Condition on return"
        hint="Selecting needs repair will move this item out of circulation."
      >
        <select
          className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
          {...register("condition")}
        >
          {conditions.map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>
      </FormField>

      {serverError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {serverError}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-campus-600 bg-campus-600 px-4 text-xs font-bold text-white hover:bg-campus-700"
          disabled={pending}
        >
          {pending ? "Returning" : "Complete return"}
        </button>
      </div>
    </form>
  );
}
