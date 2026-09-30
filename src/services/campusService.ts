import { supabase } from "./supabaseClient";
import type { Equipment, Student, Checkout } from "../types";
import { NEEDS_REPAIR } from "../constants";
import { getToday } from "../utils/format";
import { offlineStatus } from "./offlineStatus";
import {
  getDemoCheckouts,
  getDemoEquipment,
  getDemoStudents,
} from "./demoData";

type EquipmentPayload = Omit<Equipment, "id"> & {
  id?: string;
};

type CheckoutPayload = Omit<Checkout, "id" | "returnedDate">;

type ReturnEquipmentPayload = {
  checkoutId: string;
  condition: string;
};

type StudentPayload = Omit<Student, "id"> & {
  id?: string;
};

type EquipmentRow = {
  id: string;
  name: string;
  category: string;
  serial_number: string;
  location: string;
  condition: string;
  status: string;
  notes: string;
};

type StudentRow = {
  id: string;
  name: string;
  student_number: string;
  email: string;
  department: string;
  year: string;
};

type CheckoutRow = {
  id: string;
  equipment_id: string;
  student_id: string;
  checkout_date: string;
  due_date: string;
  returned_date: string | null;
};

const toEquipment = (row: EquipmentRow): Equipment => ({
  id: row.id,
  name: row.name,
  category: row.category,
  serialNumber: row.serial_number,
  location: row.location,
  condition: row.condition,
  status: row.status,
  notes: row.notes,
});

const toEquipmentRow = (item: Equipment): EquipmentRow => ({
  id: item.id,
  name: item.name,
  category: item.category,
  serial_number: item.serialNumber.trim(),
  location: item.location,
  condition: item.condition,
  status: item.status,
  notes: item.notes,
});

const toStudent = (row: StudentRow): Student => ({
  id: row.id,
  name: row.name,
  studentId: row.student_number,
  email: row.email,
  department: row.department,
  year: row.year,
});

const toStudentRow = (student: Student): StudentRow => ({
  id: student.id,
  name: student.name,
  student_number: student.studentId.trim(),
  email: student.email.trim(),
  department: student.department,
  year: student.year,
});

const toCheckout = (row: CheckoutRow): Checkout => ({
  id: row.id,
  equipmentId: row.equipment_id,
  studentId: row.student_id,
  checkoutDate: row.checkout_date,
  dueDate: row.due_date,
  returnedDate: row.returned_date,
});

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function assertNoError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function sameText(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

// A paused Supabase project can hang instead of failing, so give up after 8s.
const READ_TIMEOUT_MS = 8000;

const OFFLINE_MESSAGE =
  "The demo database is offline, so changes are paused. Please try again later.";

// Reads never fail: if Supabase is missing, errors, or times out, serve the
// bundled demo data and flag the app as offline until a read succeeds again.
async function readTable<Row, Item>(
  table: string,
  toItem: (row: Row) => Item,
  getFallback: () => Item[],
): Promise<Item[]> {
  if (!supabase) {
    offlineStatus.set(true);
    return getFallback();
  }

  try {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .abortSignal(AbortSignal.timeout(READ_TIMEOUT_MS));

    assertNoError(error);
    offlineStatus.set(false);
    return ((data ?? []) as Row[]).map(toItem);
  } catch {
    offlineStatus.set(true);
    return getFallback();
  }
}

function getWriteClient() {
  if (!supabase || offlineStatus.get()) {
    throw new Error(OFFLINE_MESSAGE);
  }
  return supabase;
}

export const campusService = {
  getEquipment(): Promise<Equipment[]> {
    return readTable("equipment", toEquipment, getDemoEquipment);
  },

  getStudents(): Promise<Student[]> {
    return readTable("students", toStudent, getDemoStudents);
  },

  getCheckouts(): Promise<Checkout[]> {
    return readTable("checkouts", toCheckout, getDemoCheckouts);
  },

  async saveEquipment(item: EquipmentPayload) {
    const db = getWriteClient();

    const serialNumber = item.serialNumber.trim();

    const { data: matches, error: matchError } = await db
      .from("equipment")
      .select("id, serial_number")
      .ilike("serial_number", serialNumber);

    assertNoError(matchError);

    const duplicate = (matches ?? []).some(
      (row) => row.id !== item.id && sameText(row.serial_number, serialNumber),
    );

    if (duplicate) {
      throw new Error("That serial number is already in use.");
    }

    if (item.id) {
      const { data: current, error: currentError } = await db
        .from("equipment")
        .select("id")
        .eq("id", item.id)
        .maybeSingle();

      assertNoError(currentError);

      if (!current) {
        throw new Error("Equipment item not found.");
      }

      const { data: activeCheckouts, error: activeError } = await db
        .from("checkouts")
        .select("id")
        .eq("equipment_id", item.id)
        .is("returned_date", null);

      assertNoError(activeError);

      const active = (activeCheckouts ?? []).length > 0;

      if (active && item.status !== "checked-out") {
        throw new Error("Return this item before changing its status.");
      }

      const { error: updateError } = await db
        .from("equipment")
        .update(toEquipmentRow({ ...item, id: item.id }))
        .eq("id", item.id);

      assertNoError(updateError);
    } else {
      const id = makeId("eq");

      const { error: insertError } = await db
        .from("equipment")
        .insert(
          toEquipmentRow({ ...item, id, status: item.status || "available" }),
        );

      assertNoError(insertError);
    }

    return item;
  },

  async deleteEquipment(id: string) {
    const db = getWriteClient();

    const { data: activeCheckouts, error: activeError } = await db
      .from("checkouts")
      .select("id")
      .eq("equipment_id", id)
      .is("returned_date", null);

    assertNoError(activeError);

    if ((activeCheckouts ?? []).length > 0) {
      throw new Error("Checked-out equipment cannot be deleted.");
    }

    const { error } = await db.from("equipment").delete().eq("id", id);
    assertNoError(error);

    return id;
  },

  async saveStudent(student: StudentPayload) {
    const db = getWriteClient();

    const studentId = student.studentId.trim();
    const email = student.email.trim();

    const { data: idMatches, error: idError } = await db
      .from("students")
      .select("id, student_number")
      .ilike("student_number", studentId);

    assertNoError(idError);

    if (
      (idMatches ?? []).some(
        (row) =>
          row.id !== student.id && sameText(row.student_number, studentId),
      )
    ) {
      throw new Error("That student ID is already registered.");
    }

    const { data: emailMatches, error: emailError } = await db
      .from("students")
      .select("id, email")
      .ilike("email", email);

    assertNoError(emailError);

    if (
      (emailMatches ?? []).some(
        (row) => row.id !== student.id && sameText(row.email, email),
      )
    ) {
      throw new Error("That email is already registered.");
    }

    if (student.id) {
      const { error: updateError } = await db
        .from("students")
        .update(toStudentRow({ ...student, id: student.id }))
        .eq("id", student.id);

      assertNoError(updateError);
    } else {
      const id = makeId("stu");

      const { error: insertError } = await db
        .from("students")
        .insert(toStudentRow({ ...student, id }));

      assertNoError(insertError);
    }

    return student;
  },

  async deleteStudent(id: string) {
    const db = getWriteClient();

    const { data: activeCheckouts, error: activeError } = await db
      .from("checkouts")
      .select("id")
      .eq("student_id", id)
      .is("returned_date", null);

    assertNoError(activeError);

    if ((activeCheckouts ?? []).length > 0) {
      throw new Error("Students with active checkouts cannot be deleted.");
    }

    const { error } = await db.from("students").delete().eq("id", id);
    assertNoError(error);

    return id;
  },

  async createCheckout(payload: CheckoutPayload) {
    const db = getWriteClient();

    const { data: equipmentRow, error: equipmentError } = await db
      .from("equipment")
      .select("*")
      .eq("id", payload.equipmentId)
      .maybeSingle();

    assertNoError(equipmentError);

    const { data: studentRow, error: studentError } = await db
      .from("students")
      .select("id")
      .eq("id", payload.studentId)
      .maybeSingle();

    assertNoError(studentError);

    if (!equipmentRow || !studentRow) {
      throw new Error("Select valid equipment and a valid student.");
    }

    if (equipmentRow.status !== "available") {
      throw new Error("This equipment is no longer available.");
    }

    if (payload.dueDate < payload.checkoutDate) {
      throw new Error("Due date must be after the checkout date.");
    }

    const checkoutRow: CheckoutRow = {
      id: makeId("co"),
      equipment_id: payload.equipmentId,
      student_id: payload.studentId,
      checkout_date: payload.checkoutDate,
      due_date: payload.dueDate,
      returned_date: null,
    };

    const { error: insertError } = await db
      .from("checkouts")
      .insert(checkoutRow);

    assertNoError(insertError);

    const { error: updateError } = await db
      .from("equipment")
      .update({ status: "checked-out" })
      .eq("id", payload.equipmentId);

    assertNoError(updateError);

    return toCheckout(checkoutRow);
  },

  async returnEquipment({ checkoutId, condition }: ReturnEquipmentPayload) {
    const db = getWriteClient();

    const { data: checkout, error: checkoutError } = await db
      .from("checkouts")
      .select("*")
      .eq("id", checkoutId)
      .maybeSingle();

    assertNoError(checkoutError);

    if (!checkout || checkout.returned_date) {
      throw new Error("This checkout is no longer active.");
    }

    const returnedDate = getToday();

    const { error: updateCheckoutError } = await db
      .from("checkouts")
      .update({ returned_date: returnedDate })
      .eq("id", checkoutId);

    assertNoError(updateCheckoutError);

    const { error: updateEquipmentError } = await db
      .from("equipment")
      .update({
        condition,
        status: condition === NEEDS_REPAIR ? "repair" : "available",
      })
      .eq("id", checkout.equipment_id);

    assertNoError(updateEquipmentError);

    return checkoutId;
  },
};
