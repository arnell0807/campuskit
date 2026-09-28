export type Equipment = {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  location: string;
  condition: string;
  status: string;
  notes: string;
};

export type Student = {
  id: string;
  name: string;
  studentId: string;
  email: string;
  department: string;
  year: string;
};

export type Checkout = {
  id: string;
  equipmentId: string;
  studentId: string;
  checkoutDate: string;
  dueDate: string;
  returnedDate: string | null;
};
