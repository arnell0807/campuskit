import type { Checkout } from "../types";

type DateFormatOptions = {
  year?: boolean;
};

export const formatDate = (
  value: string | null,
  options: DateFormatOptions = {},
) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: options.year ? "numeric" : undefined,
  }).format(new Date(`${value}T12:00:00`));
};

export const toDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getToday = () => toDateString(new Date());

export const getDaysFromToday = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateString(date);
};

export const isOverdue = (checkout: Checkout) =>
  !checkout.returnedDate && checkout.dueDate < getToday();

export const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const pluralize = (
  count: number,
  singular: string,
  plural = `${singular}s`,
) => `${count} ${count === 1 ? singular : plural}`;
