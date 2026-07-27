export type Address = {
  id: string; fullName: string; phone: string; houseNo: string; street: string; area: string;
  landmark: string; city: string; district: string; state: string; country: string; pincode: string;
  type: "Home" | "Office" | "Other"; isDefault: boolean;
};

export type CustomerProfile = {
  uid: string; name: string; email: string; phone: string; gender: string; dob: string; photoURL: string;
  wishlist: string[]; cart: unknown[]; addresses: Address[]; orders: unknown[]; reviews: unknown[];
  role: "customer" | "admin"; notifications?: { email: boolean; orderUpdates: boolean; offers: boolean }; createdAt?: unknown; lastLogin?: unknown;
};

export type SignupInput = Pick<CustomerProfile, "name" | "email" | "phone" | "gender" | "dob"> & { password: string };
