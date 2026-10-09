import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Plus,
  RotateCcw,
} from "lucide-react";
import { campusService } from "../services/campusService";
import { useEquipment } from "../hooks/useEquipment";
import { useStudents } from "../hooks/useStudents";
import { useCheckouts } from "../hooks/useCheckouts";

import { setCheckoutView, showToast } from "../features/ui/uiSlice";
import { formatDate, getInitials, isOverdue, pluralize } from "../utils/format";
import Modal from "../components/Modal";
import CheckoutForm, { CheckoutFormValues } from "../components/CheckoutForm";
import ReturnForm, { ReturnFormValues } from "../components/ReturnForm";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import type { Checkout } from "../types";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "../app/queryClient";

export default function Checkouts() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const view = useAppSelector((state) => state.ui.checkoutView);

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

  const [returningCheckout, setReturningCheckout] = useState<Checkout | null>(
    null,
  );

  const checkoutMutation = useMutation({
    mutationFn: campusService.createCheckout,
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const returnMutation = useMutation({
    mutationFn: campusService.returnEquipment,
    onSuccess: () => queryClient.invalidateQueries(),
  });

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

  const checkoutModal =
    searchParams.get("new") === "1"
      ? {
          equipmentId: searchParams.get("equipmentId") ?? undefined,
        }
      : null;

  const closeCheckoutModal = () => setSearchParams({}, { replace: true });

  const available = equipment.filter((item) => item.status === "available");

  const active = checkouts
    .filter((checkout) => !checkout.returnedDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const history = checkouts
    .filter((checkout) => checkout.returnedDate !== null)
    .sort((a, b) => b.returnedDate!.localeCompare(a.returnedDate!));

  const displayed = view === "active" ? active : history;

  const createCheckout = (values: CheckoutFormValues) => {
    checkoutMutation.mutate(values, {
      onSuccess: () => {
        closeCheckoutModal();
        dispatch(
          showToast({
            message: "Equipment checked out successfully.",
          }),
        );
      },
    });
  };

  const completeReturn = (values: ReturnFormValues) => {
    if (!returningCheckout) return;

    returnMutation.mutate(
      {
        checkoutId: returningCheckout.id,
        condition: values.condition,
      },
      {
        onSuccess: () => {
          setReturningCheckout(null);
          dispatch(
            showToast({
              message: "Equipment returned successfully.",
            }),
          );
        },
      },
    );
  };

  const returningEquipment = returningCheckout
    ? equipment.find((item) => item.id === returningCheckout.equipmentId)
    : null;

  const returningStudent = returningCheckout
    ? students.find((student) => student.id === returningCheckout.studentId)
    : null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="inline-flex rounded-sm bg-slate-200 p-1" role="tablist">
          <button
            className={`inline-flex min-h-8 items-center gap-2 rounded-sm border-0 px-3 text-xs font-bold ${
              view === "active"
                ? "bg-white text-slate-900 shadow-sm"
                : "bg-transparent text-slate-600"
            }`}
            onClick={() => dispatch(setCheckoutView("active"))}
            role="tab"
          >
            Active{" "}
            <span className="grid size-5 place-items-center rounded-full bg-slate-100 text-xs">
              {active.length}
            </span>
          </button>

          <button
            className={`inline-flex min-h-8 items-center gap-2 rounded-sm border-0 px-3 text-xs font-bold ${
              view === "history"
                ? "bg-white text-slate-900 shadow-sm"
                : "bg-transparent text-slate-600"
            }`}
            onClick={() => dispatch(setCheckoutView("history"))}
            role="tab"
          >
            Return history{" "}
            <span className="grid size-5 place-items-center rounded-full bg-slate-100 text-xs">
              {history.length}
            </span>
          </button>
        </div>

        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-sm border border-campus-600 bg-campus-600 px-4 text-xs font-bold text-white hover:bg-campus-700"
          onClick={() => {
            checkoutMutation.reset();
            setSearchParams({ new: "1" });
          }}
          disabled={!available.length}
        >
          <Plus size={17} />
          New checkout
        </button>
      </div>

      <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
        <header className="flex min-h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <h3 className="mb-1 text-sm font-extrabold text-slate-900">
              {view === "active"
                ? "Equipment currently on loan"
                : "Completed returns"}
            </h3>

            <p className="m-0 text-xs text-slate-500">
              {view === "active"
                ? pluralize(active.length, "active checkout")
                : pluralize(history.length, "completed return")}
            </p>
          </div>

          {view === "active" && (
            <div className="flex items-center gap-2 text-xs font-bold text-orange-700">
              <AlertTriangle size={16} />
              {active.filter(isOverdue).length} overdue
            </div>
          )}
        </header>

        {displayed.length ? (
          <div>
            {displayed.map((checkout) => {
              const item = equipment.find(
                (item) => item.id === checkout.equipmentId,
              );

              const student = students.find(
                (student) => student.id === checkout.studentId,
              );

              if (!item || !student) return null;

              const overdue = isOverdue(checkout);

              return (
                <article
                  className={`grid min-h-20 grid-cols-[auto_minmax(150px,1.2fr)_minmax(170px,.9fr)_minmax(120px,.7fr)_auto_auto] items-center gap-4 border-b border-slate-100 px-5 py-3 last:border-0 ${
                    overdue
                      ? "border-l-[3px] border-l-orange-600 bg-linear-to-r from-orange-50 to-white"
                      : ""
                  }`}
                  key={checkout.id}
                >
                  <div className="grid size-9 place-items-center rounded-sm bg-campus-100 text-campus-700">
                    {view === "active" ? (
                      <ArrowRight size={19} />
                    ) : (
                      <RotateCcw size={19} />
                    )}
                  </div>

                  <div>
                    <strong className="mb-1 block text-xs text-slate-900">
                      {item.name}
                    </strong>

                    <span className="block text-xs text-slate-500">
                      {item.serialNumber} · {item.category}
                    </span>
                  </div>

                  <div className="flex min-w-44 items-center gap-3">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-campus-100 text-xs font-extrabold text-campus-700">
                      {getInitials(student.name)}
                    </div>

                    <div>
                      <strong className="block text-xs text-slate-900">
                        {student.name}
                      </strong>

                      <span className="mt-1 block text-xs text-slate-500">
                        {student.studentId}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <CalendarDays size={15} />

                    <div>
                      <span className="mb-1 block text-xs">
                        {view === "active" ? "Due date" : "Returned"}
                      </span>

                      <strong className="block text-xs text-slate-700">
                        {formatDate(
                          view === "active"
                            ? checkout.dueDate
                            : checkout.returnedDate,
                          { year: true },
                        )}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <StatusBadge
                      status={
                        view === "active"
                          ? overdue
                            ? "overdue"
                            : "checked-out"
                          : "returned"
                      }
                    />
                  </div>

                  {view === "active" && (
                    <button
                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-sm border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        returnMutation.reset();
                        setReturningCheckout(checkout);
                      }}
                    >
                      <CheckCircle2 size={16} />
                      Return
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title={
              view === "active"
                ? "Nothing is checked out"
                : "No return history yet"
            }
            message={
              view === "active"
                ? "All equipment is currently accounted for."
                : "Completed returns will appear here."
            }
          />
        )}
      </section>

      {checkoutModal && (
        <Modal
          title="New checkout"
          eyebrow="Lend equipment"
          onClose={closeCheckoutModal}
        >
          <CheckoutForm
            equipment={available}
            students={students}
            preferredEquipmentId={checkoutModal.equipmentId}
            onSubmit={createCheckout}
            onCancel={closeCheckoutModal}
            pending={checkoutMutation.isPending}
            serverError={checkoutMutation.error?.message}
          />
        </Modal>
      )}

      {returningCheckout && returningEquipment && returningStudent && (
        <Modal
          title="Return equipment"
          eyebrow="Complete loan"
          onClose={() => setReturningCheckout(null)}
          size="small"
        >
          <ReturnForm
            equipment={returningEquipment}
            student={returningStudent}
            onSubmit={completeReturn}
            onCancel={() => setReturningCheckout(null)}
            pending={returnMutation.isPending}
            serverError={returnMutation.error?.message}
          />
        </Modal>
      )}
    </div>
  );
}
