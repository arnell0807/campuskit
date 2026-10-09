import { useForm } from "react-hook-form";
import FormField from "./FormField";
import type { Equipment, Student } from "../types";
import { getDaysFromToday, getToday } from "../utils/format";

export type CheckoutFormValues = {
  equipmentId: string;
  studentId: string;
  checkoutDate: string;
  dueDate: string;
};

type CheckoutFormProps = {
  equipment: Equipment[];
  students: Student[];
  onSubmit: (values: CheckoutFormValues) => void;
  onCancel: () => void;
  pending: boolean;
  serverError?: string;
  preferredEquipmentId?: string;
};

export default function CheckoutForm({
  equipment,
  students,
  onSubmit,
  onCancel,
  pending,
  serverError,
  preferredEquipmentId,
}: CheckoutFormProps) {
  const today = getToday();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    defaultValues: {
      equipmentId: preferredEquipmentId ?? "",
      studentId: "",
      checkoutDate: today,
      dueDate: getDaysFromToday(7),
    },
  });

  const checkoutDate = watch("checkoutDate");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Equipment"
          error={errors.equipmentId?.message}
          className="col-span-2"
        >
          <select
            className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            {...register("equipmentId", {
              required: "Choose an equipment item.",
            })}
            autoFocus
          >
            <option value="">Select available equipment</option>

            {equipment.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.serialNumber}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Student"
          error={errors.studentId?.message}
          className="col-span-2"
        >
          <select
            className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            {...register("studentId", {
              required: "Choose a student.",
            })}
          >
            <option value="">Select student</option>

            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} · {student.studentId}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Checkout date" error={errors.checkoutDate?.message}>
          <input
            className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            type="date"
            max={today}
            {...register("checkoutDate", {
              required: "Checkout date is required.",
            })}
          />
        </FormField>

        <FormField label="Due date" error={errors.dueDate?.message}>
          <input
            className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            type="date"
            min={checkoutDate || today}
            {...register("dueDate", {
              required: "Due date is required.",
              validate: (value) =>
                value >= checkoutDate ||
                "Due date cannot be before checkout date.",
            })}
          />
        </FormField>
      </div>

      {serverError && (
        <div className="mt-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {serverError}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          className="inline-flex min-h-10 items-center justify-center rounded-sm border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          className="inline-flex min-h-10 items-center justify-center rounded-sm border border-campus-600 bg-campus-600 px-4 text-xs font-bold text-white hover:bg-campus-700"
          disabled={pending}
        >
          {pending ? "Checking out..." : "Confirm checkout"}
        </button>
      </div>
    </form>
  );
}
