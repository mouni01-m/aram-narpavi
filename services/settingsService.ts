"use client";

import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type ThemePreference = "light" | "dark" | "system";

export type AdminSettings = {
  store: {
    name: string;
    logo: string;
    email: string;
    phone: string;
    address: string;
    gstNumber: string;
    businessRegistration: string;
  };
  admin: {
    name: string;
    email: string;
    twoFactorAuthentication: boolean;
    profilePhoto: string;
  };
  notifications: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    reviewNotifications: boolean;
    lowStockAlerts: boolean;
    customerMessages: boolean;
    pushNotifications: boolean;
  };
  payment: {
    upi: boolean;
    razorpay: boolean;
    cashOnDelivery: boolean;
  };
  shipping: {
    deliveryCharges: string;
    freeShippingLimit: string;
    estimatedDeliveryDays: string;
  };
  tax: {
    gstPercentage: string;
    cgst: string;
    sgst: string;
  };
  product: {
    defaultStock: string;
    defaultCategory: string;
    lowStockWarning: string;
  };
  order: {
    autoAcceptOrders: boolean;
    autoInvoice: boolean;
    autoEmailCustomer: boolean;
  };
  review: {
    autoApproveReviews: boolean;
    requireLogin: boolean;
    verifiedPurchaseOnly: boolean;
    allowImages: boolean;
    allowVideos: boolean;
    enableAdminReplies: boolean;
  };
  appearance: {
    theme: ThemePreference;
    accentColor: string;
  };
  security: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  about: {
    applicationVersion: string;
    firebaseProject: string;
    lastDeployment: string;
  };
};

export const defaultAdminSettings: AdminSettings = {
  store: {
    name: "Aram Narpavi Herbals",
    logo: "/logo/aram_logo.png",
    email: "support@aramnarpavi.com",
    phone: "",
    address: "",
    gstNumber: "",
    businessRegistration: "",
  },
  admin: {
    name: "Admin",
    email: "",
    twoFactorAuthentication: false,
    profilePhoto: "",
  },
  notifications: {
    emailNotifications: true,
    orderNotifications: true,
    reviewNotifications: true,
    lowStockAlerts: true,
    customerMessages: true,
    pushNotifications: false,
  },
  payment: {
    upi: true,
    razorpay: true,
    cashOnDelivery: true,
  },
  shipping: {
    deliveryCharges: "50",
    freeShippingLimit: "999",
    estimatedDeliveryDays: "3-5",
  },
  tax: {
    gstPercentage: "18",
    cgst: "9",
    sgst: "9",
  },
  product: {
    defaultStock: "25",
    defaultCategory: "Herbal Products",
    lowStockWarning: "5",
  },
  order: {
    autoAcceptOrders: false,
    autoInvoice: true,
    autoEmailCustomer: true,
  },
  review: {
    autoApproveReviews: false,
    requireLogin: true,
    verifiedPurchaseOnly: true,
    allowImages: true,
    allowVideos: true,
    enableAdminReplies: true,
  },
  appearance: {
    theme: "system",
    accentColor: "#1e5631",
  },
  security: {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  },
  about: {
    applicationVersion: "0.1.0",
    firebaseProject: "aram-narpavi-herbals-19a45",
    lastDeployment: "Not available",
  },
};

const settingsRef = doc(db, "settings", "adminDashboard");

function mergeSettings(data: Partial<AdminSettings>): AdminSettings {
  return {
    store: { ...defaultAdminSettings.store, ...data.store },
    admin: { ...defaultAdminSettings.admin, ...data.admin },
    notifications: { ...defaultAdminSettings.notifications, ...data.notifications },
    payment: { ...defaultAdminSettings.payment, ...data.payment },
    shipping: { ...defaultAdminSettings.shipping, ...data.shipping },
    tax: { ...defaultAdminSettings.tax, ...data.tax },
    product: { ...defaultAdminSettings.product, ...data.product },
    order: { ...defaultAdminSettings.order, ...data.order },
    review: { ...defaultAdminSettings.review, ...data.review },
    appearance: { ...defaultAdminSettings.appearance, ...data.appearance },
    security: defaultAdminSettings.security,
    about: { ...defaultAdminSettings.about, ...data.about },
  };
}

export async function getAdminSettings() {
  const snapshot = await getDoc(settingsRef);
  if (!snapshot.exists()) {
    await setDoc(settingsRef, {
      ...defaultAdminSettings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return defaultAdminSettings;
  }

  return mergeSettings(snapshot.data() as Partial<AdminSettings>);
}

export async function saveAdminSettings(settings: AdminSettings) {
  await setDoc(
    settingsRef,
    { ...settings, security: defaultAdminSettings.security, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function saveAdminSettingsSection<K extends keyof AdminSettings>(
  section: K,
  value: AdminSettings[K],
) {
  if (section === "security") {
    await setDoc(settingsRef, { security: defaultAdminSettings.security, updatedAt: serverTimestamp() }, { merge: true });
    return;
  }

  await setDoc(settingsRef, { [section]: value, updatedAt: serverTimestamp() }, { merge: true });
}
