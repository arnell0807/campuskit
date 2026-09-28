import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock3,
  Plus,
  RotateCcw,
  Wrench,
} from "lucide-react";
import { useEquipment } from "../hooks/useEquipment";
import { useStudents } from "../hooks/useStudents";
import { useCheckouts } from "../hooks/useCheckouts";
import { setCheckoutView } from "../features/ui/uiSlice";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { formatDate, getInitials, isOverdue, pluralize } from "../utils/format";
import { useAppDispatch } from "../app/hooks";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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

  const active = checkouts.filter((checkout) => !checkout.returnedDate);

  const overdue = active.filter(isOverdue);

  const availableCount = equipment.filter(
    (item) => item.status === "available",
  ).length;

  const repairCount = equipment.filter(
    (item) => item.status === "repair",
  ).length;

  const locationCount = new Set(equipment.map((item) => item.location)).size;

  const recent = [...checkouts]
    .sort((a, b) => b.checkoutDate.localeCompare(a.checkoutDate))
    .slice(0, 5);

  const weekday = new Intl.DateTimeFormat("en", {
    weekday: "long",
  }).format(new Date());

  const openOverdue = () => {
    dispatch(setCheckoutView("active"));
    navigate("/checkouts");
  };

  return (
    <div>
      <section className="relative mb-6 flex items-center justify-between gap-6 overflow-hidden rounded-2xl bg-linear-to-r from-campus-900 via-campus-700 to-campus-500 px-7 py-6 text-white shadow-lg">
        <div>
          <span className="mb-2 block text-xs font-extrabold uppercase tracking-widest text-campus-200">
            {weekday} overview
          </span>
          <h2 className="mb-1 text-xl font-extrabold">
            Here's what's happening today.
          </h2>
          <p className="m-0 text-sm text-campus-100">
            {overdue.length
              ? `${overdue.length} overdue ${
                  overdue.length === 1 ? "item needs" : "items need"
                } your attention today.`
              : "Everything is on track today."}
          </p>
        </div>

        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-campus-200 bg-campus-200 px-4 text-xs font-bold text-campus-900 hover:bg-white"
          onClick={() => navigate("/checkouts?new=1")}
        >
          <Plus size={17} />
          New checkout
        </button>
      </section>

      <section
        className="mb-5 grid grid-cols-4 gap-4"
        aria-label="Equipment overview"
      >
        <article className="flex min-h-32 items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-campus-100 text-campus-700">
            <Boxes size={20} />
          </div>

          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              Total Equipment
            </span>

            <strong className="mb-1 block text-2xl font-extrabold text-slate-900">
              {equipment.length}
            </strong>

            <small className="block text-xs text-slate-400">
              Across {pluralize(locationCount, "campus location")}
            </small>
          </div>
        </article>

        <article className="flex min-h-32 items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-campus-100 text-campus-700">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              Available now
            </span>

            <strong className="mb-1 block text-2xl font-extrabold text-slate-900">
              {availableCount}
            </strong>

            <small className="block text-xs text-slate-400">
              {equipment.length
                ? Math.round((availableCount / equipment.length) * 100)
                : 0}{" "}
              % of inventory
            </small>
          </div>
        </article>

        <article className="flex min-h-32 items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <Clock3 size={20} />
          </div>

          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              Checked out
            </span>

            <strong className="mb-1 block text-2xl font-extrabold text-slate-900">
              {active.length}
            </strong>

            <small className="block text-xs text-slate-400">
              {overdue.length} currently overdue
            </small>
          </div>
        </article>

        <article className="flex min-h-32 items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-100 text-red-700">
            <Wrench size={20} />
          </div>

          <div>
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              Needs repair
            </span>

            <strong className="mb-1 block text-2xl font-extrabold text-slate-900">
              {repairCount}
            </strong>

            <small className="block text-xs text-slate-400">
              Unavailable for checkout
            </small>
          </div>
        </article>
      </section>

      <div className="grid grid-cols-[minmax(0,1.7fr)_minmax(280px,.8fr)] gap-5">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="mb-1 text-sm font-extrabold text-slate-900">
                Recent Activity
              </h3>
              <p className="m-0 text-xs text-slate-500">
                Latest checkouts and returns
              </p>
            </div>

            <button
              className="inline-flex items-center gap-1 border-0 bg-transparent p-1 text-xs font-bold text-campus-600 hover:text-campus-700"
              onClick={() => navigate("/checkouts")}
            >
              View All <ArrowRight size={15} />
            </button>
          </header>

          <div className="px-5 pb-2">
            {recent.map((checkout) => {
              const item = equipment.find(
                (item) => item.id === checkout.equipmentId,
              );

              const student = students.find(
                (student) => student.id === checkout.studentId,
              );

              if (!item || !student) return null;

              const returned = checkout.returnedDate !== null;

              return (
                <div
                  className="flex min-h-16 items-center gap-3 border-b border-slate-100 last:border-0"
                  key={checkout.id}
                >
                  <div
                    className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                      returned
                        ? "bg-slate-100 text-slate-600"
                        : "bg-campus-100 text-campus-700"
                    }`}
                  >
                    {returned ? (
                      <RotateCcw size={17} />
                    ) : (
                      <ArrowRight size={17} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-xs">
                      {item.name}
                    </strong>

                    <span className="mt-1 block text-xs text-slate-500">
                      {returned ? "Returned by" : "Checked out to"}{" "}
                      {student.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <StatusBadge
                      status={
                        returned
                          ? "returned"
                          : isOverdue(checkout)
                            ? "overdue"
                            : "checked-out"
                      }
                    />

                    <small className="mt-1 block text-xs text-slate-400">
                      {formatDate(
                        returned
                          ? checkout.returnedDate
                          : checkout.checkoutDate,
                      )}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <header className="flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="mb-1 text-sm font-extrabold text-slate-900">
                Needs attention
              </h3>
              <p className="m-0 text-xs text-slate-500">Overdue equipment</p>
            </div>

            {overdue.length > 0 && (
              <span className="grid size-6 place-items-center rounded-full bg-orange-100 text-xs font-extrabold text-orange-700">
                {overdue.length}
              </span>
            )}
          </header>

          <div className="px-4 py-2">
            {overdue.length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center text-slate-500">
                <CheckCircle2 className="mb-2 text-campus-600" size={25} />

                <strong className="text-xs text-slate-800">All clear</strong>

                <span className="mt-1 text-xs">No equipment is overdue.</span>
              </div>
            ) : (
              overdue.slice(0, 4).map((checkout) => {
                const item = equipment.find(
                  (item) => item.id === checkout.equipmentId,
                );

                const student = students.find(
                  (student) => student.id === checkout.studentId,
                );

                if (!item || !student) return null;

                return (
                  <button
                    className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-0 border-b border-solid border-slate-100 bg-transparent px-1 py-3 text-left text-inherit"
                    key={checkout.id}
                    onClick={openOverdue}
                  >
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-campus-100 text-xs font-extrabold text-campus-700">
                      {getInitials(student.name)}
                    </div>

                    <div className="min-w-0">
                      <strong className="block truncate text-xs">
                        {item.name}
                      </strong>

                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {student.name} · Due {formatDate(checkout.dueDate)}
                      </span>
                    </div>

                    <AlertTriangle className="text-orange-700" size={17} />
                  </button>
                );
              })
            )}
          </div>

          {overdue.length > 0 && (
            <button
              className="mx-4 mb-4 inline-flex min-h-10 w-[calc(100%-2rem)] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
              onClick={openOverdue}
            >
              Review overdue items
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
