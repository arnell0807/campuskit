import { useForm } from "react-hook-form";

import FormField from "./FormField";

import type { Student } from "../types";

export type StudentFormValues = Omit<Student, "id">;

type StudentFormProps = {
  student?: Student | null;
  onSubmit: (values: StudentFormValues) => void;
  onCancel: () => void;
  pending: boolean;
  serverError?: string;
};

export default function StudentForm({
  student,
  onSubmit,
  onCancel,
  pending,
  serverError,
}: StudentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormValues>({
    defaultValues: student ?? undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Full name"
          error={errors.name?.message}
          className="col-span-2"
        >
          <input
            className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            {...register("name", {
              required: "Student name is required",
            })}
            placeholder="e.g. Maya Chen"
            autoFocus
          />
        </FormField>

        <FormField label="Student ID" error={errors.studentId?.message}>
          <input
            className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            {...register("studentId", {
              required: "Student ID is required.",
              pattern: {
                value: /^S?\d{5,10}$/i,
                message: "Use an ID such as S104825.",
              },
            })}
            placeholder="S104825"
          />
        </FormField>

        <FormField label="Email address" error={errors.email?.message}>
          <input
            className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email address",
              },
            })}
            placeholder="name@campus.edu"
          />
        </FormField>

        <FormField label="Department" error={errors.department?.message}>
          <input
            className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            {...register("department", {
              required: "Department is required",
            })}
            placeholder="e.g. Film & Media"
          />
        </FormField>

        <FormField label="Year of study" error={errors.year?.message}>
          <select
            className="min-h-10 w-full rounded-sm border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
            {...register("year", {
              required: "Select a year",
            })}
          >
            <option value="">Select year</option>
            {[1, 2, 3, 4, 5, 6].map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
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
          {pending ? "Saving..." : student ? "Save changes" : "Add student"}
        </button>
      </div>
    </form>
  );
}
