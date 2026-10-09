import { useForm } from "react-hook-form";
import FormField from "./FormField";
import type { Equipment } from "../types";
import { conditions } from "../constants";

export type EquipmentFormValues = Omit<Equipment, "id">;

type EquipmentFormProps = {
  item?: Equipment | null;
  onSubmit: (values: EquipmentFormValues) => void;
  onCancel: () => void;
  pending: boolean;
  serverError?: string;
};

const categories = [
  "Camera",
  "Laptop",
  "Audio",
  "Projector",
  "Accessories",
  "Lab equipment",
  "Other",
];

export default function EquipmentForm({
  item,
  onSubmit,
  onCancel,
  pending,
  serverError,
}: EquipmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EquipmentFormValues>({
    defaultValues: item ?? {
      condition: "Good",
      status: "available",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Equipment name"
          error={errors.name?.message}
          className="col-span-2"
        >
          <input
            className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            {...register("name", {
              required: "Equipment name is required",
            })}
            placeholder="e.g. Canon EOS R50"
            autoFocus
          />
        </FormField>

        <FormField label="Category" error={errors.category?.message}>
          <select
            className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            {...register("category", {
              required: "Choose a category",
            })}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Serial number" error={errors.serialNumber?.message}>
          <input
            className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            {...register("serialNumber", {
              required: "Serial number is required.",
            })}
            placeholder="e.g. CAM-1042"
          />
        </FormField>

        <FormField label="Storage location" error={errors.location?.message}>
          <input
            className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            {...register("location", {
              required: "Storage location is required",
            })}
            placeholder="e.g. Media lab"
          />
        </FormField>

        <FormField label="Condition" error={errors.condition?.message}>
          <select
            className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            {...register("condition", {
              required: true,
            })}
          >
            {conditions.map((condition) => (
              <option key={condition}>{condition}</option>
            ))}
          </select>
        </FormField>

        {item && item.status !== "checked-out" && (
          <FormField label="Availability status">
            <select
              className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
              {...register("status")}
            >
              <option value="available">Available</option>
              <option value="repair">Needs repair</option>
            </select>
          </FormField>
        )}

        <FormField
          label="Notes"
          className="col-span-2"
          hint="Optional details about accessories, faults, or handling."
        >
          <textarea
            className="min-h-10 w-full resize-y rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs leading-5 outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            {...register("notes")}
            rows={3}
            placeholder="Add helpful notes..."
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
          type="submit"
          className="inline-flex min-h-10 items-center justify-center rounded-sm border border-campus-600 bg-campus-600 px-4 text-xs font-bold text-white hover:bg-campus-700"
          disabled={pending}
        >
          {pending ? "Saving..." : item ? "Save changes" : "Add equipment"}
        </button>
      </div>
    </form>
  );
}
