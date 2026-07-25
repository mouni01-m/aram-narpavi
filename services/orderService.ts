"use client";
import { collection, doc, getDocs, limit, orderBy, query, runTransaction, serverTimestamp, updateDoc, where, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CartItem } from "@/types/product";
import type { Address } from "@/lib/user";
import type { Order, OrderCustomer, OrderStatus, OrderTotals, PaymentMethod } from "@/lib/order";

const makeReference = (prefix: string) => `${prefix}-${new Date().getFullYear()}${String(Date.now()).slice(-8)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

export async function createOrder(input: {
  customer: OrderCustomer;
  address: Address;
  items: CartItem[];
  totals: OrderTotals;
  paymentMethod: PaymentMethod;
}) {
  if (!input.items.length) {
    throw new Error("Your cart is empty.");
  }

  const orderId = makeReference("AN");
  const invoiceNumber = makeReference("INV");
  const orderRef = doc(collection(db, "orders"));

  await runTransaction(db, async (transaction) => {

    // STEP 1 - Read every product first

    const productSnapshots = await Promise.all(
      input.items.map(async (item) => {
        const ref = doc(db, "products", item.slug);
        const snapshot = await transaction.get(ref);

        return {
          item,
          ref,
          snapshot,
        };
      })
    );

    // STEP 2 - Validate stock

    for (const product of productSnapshots) {
      if (!product.snapshot.exists()) {
        throw new Error(`${product.item.name} is currently unavailable.`);
      }

      const stock = Number(product.snapshot.data().stock);

      if (!Number.isFinite(stock) || stock < product.item.quantity) {
        throw new Error(
          `${product.item.name} is no longer available in the requested quantity.`
        );
      }
    }

    // STEP 3 - Update stock

    for (const product of productSnapshots) {
      const data = product.snapshot.data();

      if (!data) {
          throw new Error(`${product.item.name} is currently unavailable.`);
        }

const stock = Number(data.stock);

      transaction.update(product.ref, {
        stock: stock - product.item.quantity,
        updatedAt: serverTimestamp(),
      });
    }

    // STEP 4 - Create order

    transaction.set(orderRef, {
      ...input,
      orderId,
      invoiceNumber,
      status: "Placed",
      paymentStatus: "Pending",
      estimatedDelivery: new Date(
        Date.now() + 5 * 86400000
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
      }),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // STEP 5 - Clear cart

    transaction.update(
      doc(db, "users", input.customer.uid),
      {
        cart: [],
        updatedAt: serverTimestamp(),
      }
    );
  });

  return {
    id: orderRef.id,
    orderId,
    invoiceNumber,
  };
}

export async function getOrders(uid?: string): Promise<Order[]> {
  try {
    const ordersCollection = collection(db, "orders");
    const ordersQuery = uid
      ? query(ordersCollection, where("customer.uid", "==", uid))
      : query(ordersCollection);

    const snapshot = await getDocs(ordersQuery);

    const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Order[];

    // Firestore ordering may require an index; sort locally by createdAt (desc) if present
    orders.sort((a, b) => {
      const aTime = a.createdAt && (a.createdAt as any).seconds ? (a.createdAt as any).seconds : 0;
      const bTime = b.createdAt && (b.createdAt as any).seconds ? (b.createdAt as any).seconds : 0;
      return bTime - aTime;
    });

    return orders;
  } catch (error) {
    // Surface Firestore errors to the console for easier debugging
    console.error("getOrders error:", error);
    return [];
  }
}

export async function cancelOrder(orderId: string) {
  const orderRef = doc(db, "orders", orderId);
  const orderSnapshot = await getDoc(orderRef);

  if (!orderSnapshot.exists()) {
    throw new Error("Order not found.");
  }

  const order = orderSnapshot.data() as Order;

  // Restore stock for all items
  await runTransaction(db, async (transaction) => {
    const productSnapshots = await Promise.all(
      order.items.map(async (item) => {
        const ref = doc(db, "products", item.slug);
        const snapshot = await transaction.get(ref);

        return {
          item,
          ref,
          snapshot,
        };
      })
    );

    // Restore stock
    for (const product of productSnapshots) {
      if (product.snapshot.exists()) {
        const data = product.snapshot.data();
        const currentStock = Number(data.stock) || 0;

        transaction.update(product.ref, {
          stock: currentStock + product.item.quantity,
          updatedAt: serverTimestamp(),
        });
      }
    }

    // Update order status
    transaction.update(orderRef, {
      status: "Cancelled",
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return order;
}


export async function updateStatus(orderId: string, status: OrderStatus) {
  await updateDoc(doc(db, "orders", orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}
