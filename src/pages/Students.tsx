import { useMemo, useState } from "react";
import { Edit3, Mail, Plus, Search, Trash2 } from "lucide-react";
import { campusService } from "../services/campusService";
import { useStudents } from "../hooks/useStudents";
import { useCheckouts } from "../hooks/useCheckouts";

import { setStudentSearch, showToast } from "../features/ui/uiSlice";
import { getInitials, pluralize } from "../utils/format";
import Modal from "../components/Modal";
import StudentForm, { StudentFormValues } from "../components/StudentForm";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import type { Student, Checkout } from "../types";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../app/queryClient";

export default function Students() {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.ui.studentSearch);

  const {
    data: students = [],
    isLoading: studentsLoading,
    error: studentsError,
  } = useStudents();
  const {
    data: checkouts = [],
    isLoading: checkoutsLoading,
    error: checkoutsError,
  } = useCheckouts();

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleting, setDeleting] = useState<Student | null>(null);

  const saveMutation = useMutation({
    mutationFn: campusService.saveStudent,
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const deleteMutation = useMutation({
    mutationFn: campusService.deleteStudent,
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const filtered = useMemo(
    () =>
      students.filter((student) =>
        `${student.name} ${student.studentId} ${student.department} ${student.email}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [students, search],
  );

  const isLoading = studentsLoading || checkoutsLoading;
  const loadError = studentsError || checkoutsError;

  if (isLoading) {
    return <EmptyState title="Loading…" message="Fetching the latest data." />;
  }

  if (loadError) {
    return (
      <EmptyState title="Couldn't load data" message={loadError.message} />
    );
  }

  const activeCount = (id: string) =>
    checkouts.filter(
      (checkout: Checkout) =>
        checkout.studentId === id && !checkout.returnedDate,
    ).length;

  const save = (values: StudentFormValues) => {
    saveMutation.mutate(
      editingStudent ? { ...values, id: editingStudent.id } : values,
      {
        onSuccess: () => {
          setEditingStudent(null);
          setIsAdding(false);

          dispatch(
            showToast({
              message: editingStudent ? "Student updated." : "Student added.",
            }),
          );
        },
      },
    );
  };

  const remove = () => {
    if (!deleting) return;

    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        setDeleting(null);
        dispatch(showToast({ message: "Student deleted." }));
      },
    });
  };

  return (
    <div>
      <div className="mb-4 grid grid-cols-[minmax(260px,1fr)_auto] gap-3">
        <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-campus-500 focus-within:ring-2 focus-within:ring-campus-100">
          <Search className="text-slate-400" size={18} />

          <input
            className="w-full border-0 p-0 text-xs outline-none"
            value={search}
            onChange={(e) => dispatch(setStudentSearch(e.target.value))}
            placeholder="Search by name, ID, or department…"
            aria-label="Search students"
          />
        </div>

        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-campus-600 bg-campus-600 px-4 text-xs font-bold text-white hover:bg-campus-700"
          onClick={() => {
            saveMutation.reset();
            setEditingStudent(null);
            setIsAdding(true);
          }}
        >
          <Plus size={17} />
          Add student
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-16 items-center gap-2 border-b border-slate-200 px-5">
          <strong className="text-sm font-extrabold">
            {pluralize(filtered.length, "student")}
          </strong>

          <span className="text-xs text-slate-500">
            registered to borrow equipment
          </span>
        </div>

        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  {["Student", "Department", "Year", "Current loans"].map(
                    (heading) => (
                      <th
                        className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-500"
                        key={heading}
                      >
                        {heading}
                      </th>
                    ),
                  )}

                  <th className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((student) => {
                  const count = activeCount(student.id);

                  return (
                    <tr className="hover:bg-slate-50/60" key={student.id}>
                      <td className="border-b border-slate-100 px-5 py-4 text-xs text-slate-600">
                        <div className="flex min-w-56 items-center gap-3">
                          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-campus-100 text-xs font-extrabold text-campus-700">
                            {getInitials(student.name)}
                          </div>

                          <div>
                            <strong className="block text-xs text-slate-900">
                              {student.name}
                            </strong>

                            <span className="mt-1 block text-xs text-slate-500">
                              {student.studentId} · {student.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="border-b border-slate-100 px-5 py-4 text-xs text-slate-600">
                        {student.department}
                      </td>

                      <td className="border-b border-slate-100 px-5 py-4 text-xs text-slate-600">
                        Year {student.year}
                      </td>

                      <td className="border-b border-slate-100 px-5 py-4 text-xs text-slate-600">
                        <span
                          className={`inline-grid size-6 place-items-center rounded-full text-xs font-extrabold ${
                            count
                              ? "bg-campus-100 text-campus-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {count}
                        </span>
                      </td>

                      <td className="border-b border-slate-100 px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <a
                            className="inline-grid size-8 place-items-center rounded-lg text-slate-500 no-underline hover:bg-slate-100"
                            href={`mailto:${student.email}`}
                            aria-label={`Email ${student.name}`}
                          >
                            <Mail size={17} />
                          </a>

                          <button
                            className="inline-grid size-8 place-items-center rounded-lg border-0 bg-transparent text-slate-500 hover:bg-slate-100"
                            onClick={() => {
                              saveMutation.reset();
                              setEditingStudent(student);
                              setIsAdding(false);
                            }}
                            aria-label={`Edit ${student.name}`}
                          >
                            <Edit3 size={17} />
                          </button>

                          <button
                            className="inline-grid size-8 place-items-center rounded-lg border-0 bg-transparent text-slate-500 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              deleteMutation.reset();
                              setDeleting(student);
                            }}
                            aria-label={`Delete ${student.name}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No students found"
            message="Try a different name, ID, email, or department."
            action={
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
                onClick={() => dispatch(setStudentSearch(""))}
              >
                Clear search
              </button>
            }
          />
        )}
      </section>

      {(editingStudent || isAdding) && (
        <Modal
          title={editingStudent ? "Edit student" : "Add student"}
          eyebrow={editingStudent ? editingStudent.studentId : "New borrower"}
          onClose={() => {
            setEditingStudent(null);
            setIsAdding(false);
          }}
        >
          <StudentForm
            student={editingStudent}
            onSubmit={save}
            onCancel={() => {
              setEditingStudent(null);
              setIsAdding(false);
            }}
            pending={saveMutation.isPending}
            serverError={saveMutation.error?.message}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete student?"
          message={`Delete ${deleting.name}? Their completed checkout records will also be removed.`}
          onConfirm={remove}
          onClose={() => setDeleting(null)}
          pending={deleteMutation.isPending}
        />
      )}

      {deleteMutation.error && deleting && (
        <div
          className="fixed bottom-8 left-1/2 z-alert -translate-x-1/2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 shadow-lg"
          role="alert"
        >
          {deleteMutation.error.message}
        </div>
      )}
    </div>
  );
}
