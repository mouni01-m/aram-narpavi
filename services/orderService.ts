"use client";
import { collection, doc, getDocs, limit, orderBy, query, runTransaction, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CartItem } from "@/types/product";
import type { Address } from "@/lib/user";
import type { Order, OrderCustomer, OrderStatus, OrderTotals, PaymentMethod } from "@/lib/order";

const makeReference = (prefix: string) => `${prefix}-${new Date().getFullYear()}${String(Date.now()).slice(-8)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

export async function createOrder(input: { customer: OrderCustomer; address: Address; items: CartItem[]; totals: OrderTotals; paymentMethod: PaymentMethod }) {
  if (!input.items.length) throw new Error("Your cart is empty.");

  const orderId = makeReference("AN");
  const invoiceNumber = makeReference("INV");
  const orderRef = doc(collection(db, "orders"));

  await runTransaction(db, async (transaction) => {
    for (const item of input.items) {
      const productRef = doc(db, "products", item.id);
      const product = await transaction.get(productRef);

      if (!product.exists()) {
        throw new Error(`${item.name} is currently unavailable.`);
      }

      const stock = product.data()?.stock;
      const safeStock = typeof stock === "number" ? stock : Number(stock);

      if (!Number.isFinite(safeStock) || safeStock < 0) {
        throw new Error(`${item.name} is currently unavailable.`);
      }

      if (safeStock < item.quantity) {
        throw new Error(`${item.name} is no longer available in the requested quantity.`);
      }

      transaction.update(productRef, { stock: safeStock - item.quantity, updatedAt: serverTimestamp() });
    }

    transaction.set(orderRef, {
      ...input,
      orderId,
      invoiceNumber,
      status: "Placed",
      paymentStatus: "Pending",
      estimatedDelivery: new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "long" }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.update(doc(db, "users", input.customer.uid), { cart: [], updatedAt: serverTimestamp() });
  });

  return { id: orderRef.id, orderId, invoiceNumber };
}

export async function cancelOrder(id: string) {
  await runTransaction(db, async (transaction) => {
    const orderRef = doc(db, "orders", id);
    const orderSnapshot = await transaction.get(orderRef);

    if (!orderSnapshot.exists()) return;

    const orderData = orderSnapshot.data() as Partial<Order> & { items?: CartItem[] };
    if (orderData.status === "Cancelled") return;

    for (const item of orderData.items ?? []) {
      const productRef = doc(db, "products", item.id);
      const productSnapshot = await transaction.get(productRef);
      if (!productSnapshot.exists()) continue;
      const stock = productSnapshot.data()?.stock;
      const safeStock = typeof stock === "number" ? stock : Number(stock);
      const nextStock = Number.isFinite(safeStock) ? safeStock + item.quantity : item.quantity;
      transaction.update(productRef, { stock: nextStock, updatedAt: serverTimestamp() });
    }

    transaction.update(orderRef, { status: "Cancelled", updatedAt: serverTimestamp() });
  });
}

export async function updateStatus(id: string, status: OrderStatus) {
  await updateDoc(doc(db, "orders", id), { status, updatedAt: serverTimestamp() });
}

export async function getOrders(uid?: string) {
  const base = collection(db, "orders");
  const source = uid
    ? query(base, where("customer.uid", "==", uid), orderBy("createdAt", "desc"), limit(50))
    : query(base, orderBy("createdAt", "desc"), limit(100));
  const snapshot = await getDocs(source);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Order);
}
