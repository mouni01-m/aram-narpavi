"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import {
  BellRing,
  Box,
  Building2,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  FileDown,
  KeyRound,
  Package,
  Palette,
  ReceiptText,
  RotateCcw,
  Save,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Upload,
  UserCog,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { changePassword } from "@/services/authService";
import {
  defaultAdminSettings,
  getAdminSettings,
  saveAdminSettings,
  saveAdminSettingsSection,
  type AdminSettings,
} from "@/services/settingsService";
import { AvatarUploader } from "@/app/admin/settings/components/AvatarUploader";
import { SettingsCard } from "@/app/admin/settings/components/SettingsCard";
import { SettingsInput } from "@/app/admin/settings/components/SettingsInput";
import { ToggleSwitch } from "@/app/admin/settings/components/ToggleSwitch";

type SaveState = "idle" | "saving" | "saved" | "error";

const inputGrid = "grid gap-4 md:grid-cols-2 xl:grid-cols-3";
const toggleGrid = "grid gap-3 md:grid-cols-2 xl:grid-cols-3";

function SettingButton({
  children,
  onClick,
  variant = "primary",
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void | Promise<void>;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={() => void onClick?.()}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold shadow-sm transition ${
        variant === "primary"
          ? "bg-[#1e5631] text-white hover:bg-[#174526]"
          : "border border-[#dbe3db] bg-white text-[#344238] hover:bg-[#f7faf7]"
      }`}
    >
      {children}
    </button>
  );
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "id\n";
  const headers = Array.from(rows.reduce<Set<string>>((keys, row) => {
    Object.keys(row).forEach((key) => keys.add(key));
    return keys;
  }, new Set<string>()));
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<AdminSettings>(defaultAdminSettings);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [passwordMessage, setPasswordMessage] = useState("");

  const adminDisplayName = useMemo(
    () => profile?.name || user?.displayName || settings.admin.name || "Admin",
    [profile?.name, settings.admin.name, user?.displayName],
  );

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const remoteSettings = await getAdminSettings();
        if (!active) return;
        setSettings({
          ...remoteSettings,
          admin: {
            ...remoteSettings.admin,
            name: remoteSettings.admin.name || profile?.name || user?.displayName || "Admin",
            email: remoteSettings.admin.email || user?.email || "",
            profilePhoto: remoteSettings.admin.profilePhoto || profile?.photoURL || user?.photoURL || "",
          },
        });
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSettings();
    return () => {
      active = false;
    };
  }, [profile?.name, profile?.photoURL, user?.displayName, user?.email, user?.photoURL]);

  async function updateSection<K extends keyof AdminSettings>(section: K, value: AdminSettings[K]) {
    setSettings((current) => ({ ...current, [section]: value }));
    setSaveState("saving");
    try {
      await saveAdminSettingsSection(section, value);
      setSaveState("saved");
    } catch (error) {
      console.error("Settings save failed", error);
      setSaveState("error");
    }
  }

  function updateField<K extends keyof AdminSettings, F extends keyof AdminSettings[K]>(
    section: K,
    field: F,
    value: AdminSettings[K][F],
  ) {
    const nextSection = { ...settings[section], [field]: value } as AdminSettings[K];
    void updateSection(section, nextSection);
  }

  async function handleSaveAll() {
    setSaveState("saving");
    try {
      await saveAdminSettings(settings);
      setSaveState("saved");
    } catch (error) {
      console.error("Settings save failed", error);
      setSaveState("error");
    }
  }

  async function handlePasswordChange() {
    setPasswordMessage("");
    if (!settings.security.currentPassword || !settings.security.newPassword) {
      setPasswordMessage("Enter your current and new password.");
      return;
    }
    if (settings.security.newPassword !== settings.security.confirmPassword) {
      setPasswordMessage("New password and confirmation must match.");
      return;
    }

    try {
      await changePassword(settings.security.currentPassword, settings.security.newPassword);
      await updateSection("security", defaultAdminSettings.security);
      setPasswordMessage("Password updated.");
    } catch (error) {
      console.error("Password update failed", error);
      setPasswordMessage("Password update failed. Please sign in again and retry.");
    }
  }

  async function exportFirestoreData() {
    downloadFile("admin-settings.json", JSON.stringify(settings, null, 2), "application/json");
  }

  async function importFirestoreData(file: File | undefined) {
    if (!file) return;
    const parsed = JSON.parse(await file.text()) as Partial<AdminSettings>;
    const next = { ...defaultAdminSettings, ...parsed };
    setSettings(next);
    await saveAdminSettings(next);
    setSaveState("saved");
  }

  async function downloadCollectionCsv(collectionName: "orders" | "reviews") {
    const snapshot = await getDocs(collection(db, collectionName));
    const rows = snapshot.docs.map((document) => ({ id: document.id, ...document.data() }));
    downloadFile(`${collectionName}.csv`, toCsv(rows), "text/csv");
  }

  const saveLabel = saveState === "saving" ? "Saving" : saveState === "saved" ? "Saved" : saveState === "error" ? "Save failed" : "Ready";

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-[#1e5631] border-t-transparent" />
          <p className="text-sm font-bold text-[#344238]">Loading settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-[#dfe7df] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5f6f64]">Admin settings</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-normal text-[#17251d]">Settings</h1>
          <p className="mt-2 max-w-3xl text-sm text-[#647067]">
            Manage store operations, admin security, notifications, payments, shipping, reviews, and backups from one workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
            saveState === "error" ? "bg-[#fff1f0] text-[#b42318]" : "bg-[#edf7ed] text-[#1e5631]"
          }`}>
            <CheckCircle2 className="size-4" aria-hidden="true" />
            {saveLabel}
          </span>
          <SettingButton onClick={handleSaveAll}>
            <Save className="size-4" aria-hidden="true" />
            Save Changes
          </SettingButton>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <SettingsCard title="Store Settings" description="Core business identity and contact information." icon={Building2} action={<SettingButton onClick={handleSaveAll}><Save className="size-4" />Save Changes</SettingButton>}>
            <div className={inputGrid}>
              <SettingsInput label="Store Name" value={settings.store.name} onChange={(value) => updateField("store", "name", value)} />
              <SettingsInput label="Store Logo" value={settings.store.logo} onChange={(value) => updateField("store", "logo", value)} />
              <SettingsInput label="Store Email" type="email" value={settings.store.email} onChange={(value) => updateField("store", "email", value)} />
              <SettingsInput label="Store Phone" value={settings.store.phone} onChange={(value) => updateField("store", "phone", value)} />
              <SettingsInput label="GST Number" value={settings.store.gstNumber} onChange={(value) => updateField("store", "gstNumber", value)} />
              <SettingsInput label="Business Registration" value={settings.store.businessRegistration} onChange={(value) => updateField("store", "businessRegistration", value)} />
              <div className="md:col-span-2 xl:col-span-3">
                <SettingsInput label="Address" multiline value={settings.store.address} onChange={(value) => updateField("store", "address", value)} />
              </div>
            </div>
          </SettingsCard>

          <SettingsCard title="Admin Settings" description="Personal admin profile, sign-in identity, and account controls." icon={UserCog} action={<SettingButton onClick={handleSaveAll}><Save className="size-4" />Save</SettingButton>}>
            <div className="space-y-4">
              <AvatarUploader name={adminDisplayName} imageUrl={settings.admin.profilePhoto} onChange={(value) => updateField("admin", "profilePhoto", value)} />
              <div className={inputGrid}>
                <SettingsInput label="Admin Name" value={settings.admin.name} onChange={(value) => updateField("admin", "name", value)} />
                <SettingsInput label="Email" type="email" value={settings.admin.email} onChange={(value) => updateField("admin", "email", value)} />
                <SettingsInput label="Change Password" type="password" value={settings.security.newPassword} onChange={(value) => updateField("security", "newPassword", value)} />
              </div>
              <ToggleSwitch label="Two Factor Authentication" checked={settings.admin.twoFactorAuthentication} onChange={(value) => updateField("admin", "twoFactorAuthentication", value)} />
            </div>
          </SettingsCard>

          <SettingsCard title="Notifications" description="Choose which events should notify admins and customers." icon={BellRing}>
            <div id="notifications" className={toggleGrid}>
              <ToggleSwitch label="Email Notifications" checked={settings.notifications.emailNotifications} onChange={(value) => updateField("notifications", "emailNotifications", value)} />
              <ToggleSwitch label="Order Notifications" checked={settings.notifications.orderNotifications} onChange={(value) => updateField("notifications", "orderNotifications", value)} />
              <ToggleSwitch label="Review Notifications" checked={settings.notifications.reviewNotifications} onChange={(value) => updateField("notifications", "reviewNotifications", value)} />
              <ToggleSwitch label="Low Stock Alerts" checked={settings.notifications.lowStockAlerts} onChange={(value) => updateField("notifications", "lowStockAlerts", value)} />
              <ToggleSwitch label="Customer Messages" checked={settings.notifications.customerMessages} onChange={(value) => updateField("notifications", "customerMessages", value)} />
              <ToggleSwitch label="Push Notifications" checked={settings.notifications.pushNotifications} onChange={(value) => updateField("notifications", "pushNotifications", value)} />
            </div>
          </SettingsCard>

          <SettingsCard title="Payment Settings" description="Enable or disable checkout payment methods." icon={CreditCard}>
            <div className={toggleGrid}>
              <ToggleSwitch label="UPI" checked={settings.payment.upi} onChange={(value) => updateField("payment", "upi", value)} />
              <ToggleSwitch label="Razorpay" checked={settings.payment.razorpay} onChange={(value) => updateField("payment", "razorpay", value)} />
              <ToggleSwitch label="Cash On Delivery" checked={settings.payment.cashOnDelivery} onChange={(value) => updateField("payment", "cashOnDelivery", value)} />
            </div>
          </SettingsCard>

          <SettingsCard title="Shipping Settings" description="Set delivery fees, free shipping rules, and customer promise dates." icon={Truck}>
            <div className={inputGrid}>
              <SettingsInput label="Delivery Charges" value={settings.shipping.deliveryCharges} onChange={(value) => updateField("shipping", "deliveryCharges", value)} />
              <SettingsInput label="Free Shipping Limit" value={settings.shipping.freeShippingLimit} onChange={(value) => updateField("shipping", "freeShippingLimit", value)} />
              <SettingsInput label="Estimated Delivery Days" value={settings.shipping.estimatedDeliveryDays} onChange={(value) => updateField("shipping", "estimatedDeliveryDays", value)} />
            </div>
          </SettingsCard>

          <SettingsCard title="Tax Settings" description="Configure GST, CGST, and SGST values used across invoices." icon={ReceiptText}>
            <div className={inputGrid}>
              <SettingsInput label="GST %" value={settings.tax.gstPercentage} onChange={(value) => updateField("tax", "gstPercentage", value)} />
              <SettingsInput label="CGST" value={settings.tax.cgst} onChange={(value) => updateField("tax", "cgst", value)} />
              <SettingsInput label="SGST" value={settings.tax.sgst} onChange={(value) => updateField("tax", "sgst", value)} />
            </div>
          </SettingsCard>

          <SettingsCard title="Product Settings" description="Defaults used when creating and monitoring products." icon={Package}>
            <div className={inputGrid}>
              <SettingsInput label="Default Stock" value={settings.product.defaultStock} onChange={(value) => updateField("product", "defaultStock", value)} />
              <SettingsInput label="Default Category" value={settings.product.defaultCategory} onChange={(value) => updateField("product", "defaultCategory", value)} />
              <SettingsInput label="Low Stock Warning" value={settings.product.lowStockWarning} onChange={(value) => updateField("product", "lowStockWarning", value)} />
            </div>
          </SettingsCard>

          <SettingsCard title="Order Settings" description="Control order automation for operations and customer communication." icon={ShoppingBag}>
            <div className={toggleGrid}>
              <ToggleSwitch label="Auto Accept Orders" checked={settings.order.autoAcceptOrders} onChange={(value) => updateField("order", "autoAcceptOrders", value)} />
              <ToggleSwitch label="Auto Invoice" checked={settings.order.autoInvoice} onChange={(value) => updateField("order", "autoInvoice", value)} />
              <ToggleSwitch label="Auto Email Customer" checked={settings.order.autoEmailCustomer} onChange={(value) => updateField("order", "autoEmailCustomer", value)} />
            </div>
          </SettingsCard>

          <SettingsCard title="Review Settings" description="Moderate review submissions, rich media, and reply permissions." icon={Eye}>
            <div className={toggleGrid}>
              <ToggleSwitch label="Auto Approve Reviews" checked={settings.review.autoApproveReviews} onChange={(value) => updateField("review", "autoApproveReviews", value)} />
              <ToggleSwitch label="Require Login" checked={settings.review.requireLogin} onChange={(value) => updateField("review", "requireLogin", value)} />
              <ToggleSwitch label="Verified Purchase Only" checked={settings.review.verifiedPurchaseOnly} onChange={(value) => updateField("review", "verifiedPurchaseOnly", value)} />
              <ToggleSwitch label="Allow Images" checked={settings.review.allowImages} onChange={(value) => updateField("review", "allowImages", value)} />
              <ToggleSwitch label="Allow Videos" checked={settings.review.allowVideos} onChange={(value) => updateField("review", "allowVideos", value)} />
              <ToggleSwitch label="Enable Admin Replies" checked={settings.review.enableAdminReplies} onChange={(value) => updateField("review", "enableAdminReplies", value)} />
            </div>
          </SettingsCard>
        </div>

        <aside className="space-y-6">
          <SettingsCard title="Appearance" description="Set the admin theme and primary accent." icon={Palette}>
            <div id="appearance" className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(["light", "dark", "system"] as const).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => updateField("appearance", "theme", theme)}
                    className={`rounded-lg border px-3 py-2 text-sm font-bold capitalize transition ${
                      settings.appearance.theme === theme ? "border-[#1e5631] bg-[#edf7ed] text-[#1e5631]" : "border-[#dfe7df] bg-white text-[#647067] hover:bg-[#f7faf7]"
                    }`}
                  >
                    {theme === "system" ? "System Theme" : `${theme} Mode`}
                  </button>
                ))}
              </div>
              <SettingsInput label="Accent Color" type="color" value={settings.appearance.accentColor} onChange={(value) => updateField("appearance", "accentColor", value)} />
            </div>
          </SettingsCard>

          <SettingsCard title="Security" description="Update admin password securely with Firebase Authentication." icon={KeyRound}>
            <div className="space-y-4">
              <SettingsInput label="Current Password" type="password" value={settings.security.currentPassword} onChange={(value) => updateField("security", "currentPassword", value)} />
              <SettingsInput label="New Password" type="password" value={settings.security.newPassword} onChange={(value) => updateField("security", "newPassword", value)} />
              <SettingsInput label="Confirm Password" type="password" value={settings.security.confirmPassword} onChange={(value) => updateField("security", "confirmPassword", value)} />
              {passwordMessage ? <p className="text-sm font-semibold text-[#647067]">{passwordMessage}</p> : null}
              <SettingButton onClick={handlePasswordChange}>
                <ShieldCheck className="size-4" />
                Update Password
              </SettingButton>
            </div>
          </SettingsCard>

          <SettingsCard title="Backup" description="Export settings and download operational CSV files." icon={Box}>
            <div className="space-y-3">
              <SettingButton variant="secondary" onClick={exportFirestoreData}><Download className="size-4" />Export Firestore Data</SettingButton>
              <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#dbe3db] bg-white px-4 text-sm font-bold text-[#344238] shadow-sm transition hover:bg-[#f7faf7]">
                <Upload className="size-4" />
                Import Firestore Data
                <input type="file" accept="application/json" className="sr-only" onChange={(event) => void importFirestoreData(event.target.files?.[0])} />
              </label>
              <SettingButton variant="secondary" onClick={() => downloadCollectionCsv("orders")}><FileDown className="size-4" />Download Orders CSV</SettingButton>
              <SettingButton variant="secondary" onClick={() => downloadCollectionCsv("reviews")}><FileDown className="size-4" />Download Reviews CSV</SettingButton>
            </div>
          </SettingsCard>

          <SettingsCard title="About" description="Deployment and project information." icon={RotateCcw}>
            <div id="about" className="space-y-3 text-sm">
              <div className="rounded-lg border border-[#e3e9e3] bg-[#fbfcfb] p-3">
                <p className="font-bold text-[#344238]">Application Version</p>
                <p className="mt-1 text-[#647067]">{settings.about.applicationVersion}</p>
              </div>
              <div className="rounded-lg border border-[#e3e9e3] bg-[#fbfcfb] p-3">
                <p className="font-bold text-[#344238]">Firebase Project</p>
                <p className="mt-1 break-words text-[#647067]">{settings.about.firebaseProject}</p>
              </div>
              <div className="rounded-lg border border-[#e3e9e3] bg-[#fbfcfb] p-3">
                <p className="font-bold text-[#344238]">Last Deployment</p>
                <p className="mt-1 text-[#647067]">{settings.about.lastDeployment}</p>
              </div>
            </div>
          </SettingsCard>
        </aside>
      </div>
    </div>
  );
}
