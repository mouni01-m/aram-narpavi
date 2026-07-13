export type Address = { id: string; label: string; line1: string; city: string; state: string; postalCode: string };

export type CustomerProfile = {
  uid: string; name: string; email: string; phone: string; gender: string; dob: string; photoURL: string;
  wishlist: string[]; cart: unknown[]; addresses: Address[]; orders: unknown[]; reviews: unknown[];
  role: "customer" | "admin"; createdAt?: unknown; lastLogin?: unknown;
};

export type SignupInput = Pick<CustomerProfile, "name" | "email" | "phone" | "gender" | "dob"> & { password: string };
