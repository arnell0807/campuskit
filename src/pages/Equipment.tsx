import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit3,
  MapPin,
  MoreHorizontal,
  PackagePlus,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { campusService } from "../services/campusService";
import { useEquipment } from "../hooks/useEquipment";
import { useStudents } from "../hooks/useStudents";
import { useCheckouts } from "../hooks/useCheckouts";

import {
  clearEquipmentFilters,
  setEquipmentFilter,
  showToast,
} from "../features/ui/uiSlice";
import EquipmentForm, {
  EquipmentFormValues,
} from "../components/EquipmentForm";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import type { Equipment } from "../types";
import { formatDate } from "../utils/format";
import { queryClient } from "../app/queryClient";
import { useMutation } from "@tanstack/react-query";

const categoryStyles: Record<string, string> = {
  Laptop: "from-slate-100 to-blue-100 text-blue-700",
  Audio: "from-amber-50 to-amber-100 text-amber-800",
  Projector: "from-purple-50 to-purple-100 text-purple-700",
  Accessories: "from-lime-50 to-lime-100 text-lime-800",
};

export default function Equipment() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const filters = useAppSelector((state) => state.ui.equipmentFilters);

  const {
    data: equipment = [],
    isLoading: equipmentLoading,
    error: equipmentError,
  } = useEquipment();
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

  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(
    null,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [deleting, setDeleting] = useState<Equipment | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    if (!openMenu) return undefined;

    const closeOnOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-equipment-menu]")) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [openMenu]);

  const saveMutation = useMutation({
    mutationFn: campusService.saveEquipment,
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const deleteMutation = useMutation({
    mutationFn: campusService.deleteEquipment,
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const categories = [
    ...new Set(equipment.map((item) => item.category)),
  ].sort();

  const filtered = useMemo(
    () =>
      equipment.filter((item) => {
        const haystack =
          `${item.name} ${item.serialNumber} ${item.location}`.toLowerCase();

        return (
          haystack.includes(filters.search.toLowerCase()) &&
          (filters.category === "all" || item.category === filters.category) &&
          (filters.status === "all" || item.status === filters.status)
        );
      }),
    [equipment, filters],
  );

  const isLoading = equipmentLoading || studentsLoading || checkoutsLoading;
  const loadError = equipmentError || studentsError || checkoutsError;

  if (isLoading) {
    return <EmptyState title="Loading…" message="Fetching the latest data." />;
  }

  if (loadError) {
    return (
      <EmptyState title="Couldn't load data" message={loadError.message} />
    );
  }

  const checkoutInfo = (equipmentId: string) => {
    const checkout = checkouts.find(
      (item) => item.equipmentId === equipmentId && !item.returnedDate,
    );

    const student =
      checkout && students.find((item) => item.id === checkout.studentId);

    return checkout && student
      ? `${student.name} · due ${formatDate(checkout.dueDate)}`
      : null;
  };

  const save = (values: EquipmentFormValues) => {
    saveMutation.mutate(
      editingEquipment ? { ...values, id: editingEquipment.id } : values,
      {
        onSuccess: () => {
          setEditingEquipment(null);
          setIsAdding(false);

          dispatch(
            showToast({
              message: editingEquipment
                ? "Equipment updated."
                : "Equipment added.",
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
        dispatch(showToast({ message: "Equipment deleted." }));
      },
    });
  };

  return (
    <div>
      <div className="mb-4 grid grid-cols-[minmax(240px,1fr)_170px_150px_auto] gap-3">
        <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-campus-500 focus-within:ring-2 focus-within:ring-campus-100">
          <Search className="text-slate-400" size={18} />

          <input
            className="w-full border-0 p-0 text-xs outline-none"
            value={filters.search}
            onChange={(event) =>
              dispatch(
                setEquipmentFilter({
                  key: "search",
                  value: event.target.value,
                }),
              )
            }
            placeholder="Search equipment…"
            aria-label="Search equipment"
          />
        </div>

        <select
          className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
          value={filters.category}
          onChange={(event) =>
            dispatch(
              setEquipmentFilter({
                key: "category",
                value: event.target.value,
              }),
            )
          }
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs outline-none focus:border-campus-500 focus:ring-2 focus:ring-campus-100"
          value={filters.status}
          onChange={(event) =>
            dispatch(
              setEquipmentFilter({
                key: "status",
                value: event.target.value,
              }),
            )
          }
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="available">Available</option>
          <option value="checked-out">Checked out</option>
          <option value="repair">Needs repair</option>
        </select>

        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-campus-600 bg-campus-600 px-4 text-xs font-bold text-white hover:bg-campus-700"
          onClick={() => {
            saveMutation.reset();
            setEditingEquipment(null);
            setIsAdding(true);
          }}
        >
          <Plus size={17} />
          Add equipment
        </button>
      </div>

      <div className="flex min-h-8 items-start justify-between text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{filtered.length}</strong>{" "}
          of {equipment.length} items
        </span>

        {(filters.search ||
          filters.category !== "all" ||
          filters.status !== "all") && (
          <button
            className="inline-flex items-center gap-1 border-0 bg-transparent p-1 text-xs font-bold text-campus-600"
            onClick={() => dispatch(clearEquipmentFilters())}
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length ? (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((item) => {
            const loanInfo = checkoutInfo(item.id);

            return (
              <article
                className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                key={item.id}
              >
                <div
                  className={`relative flex h-24 items-center gap-3 overflow-hidden bg-linear-to-br px-5 ${
                    categoryStyles[item.category] ??
                    "from-campus-50 to-campus-100 text-campus-700"
                  }`}
                >
                  <PackagePlus size={34} strokeWidth={1.5} />

                  <span className="text-xs font-extrabold uppercase tracking-wider">
                    {item.category}
                  </span>

                  <div
                    className="absolute right-3 top-3 z-20"
                    data-equipment-menu
                  >
                    <button
                      className="inline-grid size-9 place-items-center rounded-lg border-0 bg-white/70 p-0 text-slate-600 hover:bg-white"
                      onClick={() =>
                        setOpenMenu(openMenu === item.id ? null : item.id)
                      }
                      aria-label={`Actions for ${item.name}`}
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {openMenu === item.id && (
                      <div className="absolute right-0 top-10 w-32 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                        <button
                          className="flex w-full items-center gap-2 rounded-md border-0 bg-transparent p-2 text-left text-xs font-semibold text-slate-800 hover:bg-slate-100"
                          onClick={() => {
                            saveMutation.reset();
                            setEditingEquipment(item);
                            setIsAdding(false);
                            setOpenMenu(null);
                          }}
                        >
                          <Edit3 size={15} />
                          Edit
                        </button>

                        <button
                          className="flex w-full items-center gap-2 rounded-md border-0 bg-transparent p-2 text-left text-xs font-semibold text-red-700 hover:bg-red-50"
                          onClick={() => {
                            deleteMutation.reset();
                            setDeleting(item);
                            setOpenMenu(null);
                          }}
                        >
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex min-h-11 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="mb-1 truncate text-sm font-extrabold text-slate-900">
                        {item.name}
                      </h3>

                      <span className="text-xs tracking-wide text-slate-500">
                        {item.serialNumber}
                      </span>
                    </div>

                    <StatusBadge status={item.status} />
                  </div>

                  <div className="mt-2 flex min-h-10 items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={14} />
                      {item.location}
                    </span>

                    <span>
                      Condition:{" "}
                      <strong className="text-slate-700">
                        {item.condition}
                      </strong>
                    </span>
                  </div>

                  {loanInfo && (
                    <div className="my-2 truncate rounded-md bg-amber-50 p-2 text-xs text-amber-800">
                      With {loanInfo}
                    </div>
                  )}

                  <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                    <button
                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        saveMutation.reset();
                        setEditingEquipment(item);
                        setIsAdding(false);
                      }}
                    >
                      Edit details
                    </button>

                    <button
                      className="inline-flex min-h-9 items-center justify-center rounded-lg border border-campus-600 bg-campus-600 px-3 text-xs font-bold text-white hover:bg-campus-700"
                      disabled={item.status !== "available"}
                      onClick={() =>
                        navigate(`/checkouts?new=1&equipmentId=${item.id}`)
                      }
                    >
                      Check out
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No equipment found"
          message="Try changing your search or filters."
          action={
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
              onClick={() => dispatch(clearEquipmentFilters())}
            >
              Clear filters
            </button>
          }
        />
      )}

      {(editingEquipment || isAdding) && (
        <Modal
          title={editingEquipment ? "Edit equipment" : "Add equipment"}
          eyebrow={
            editingEquipment
              ? editingEquipment.serialNumber
              : "New inventory item"
          }
          onClose={() => {
            setEditingEquipment(null);
            setIsAdding(false);
          }}
        >
          <EquipmentForm
            item={editingEquipment}
            onSubmit={save}
            onCancel={() => {
              setEditingEquipment(null);
              setIsAdding(false);
            }}
            pending={saveMutation.isPending}
            serverError={saveMutation.error?.message}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete equipment?"
          message={`Delete ${deleting.name}? Its completed checkout records will also be removed.`}
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
