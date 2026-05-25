import type { Cart, CartItem, Order, Product, User } from "./types";

// In-memory store. Persists for the lifetime of the dev server process.
// Singleton pattern survives Next.js hot reloads via globalThis.

interface Store {
  users: User[];
  products: Product[];
  carts: Map<string, Cart>; // keyed by anonymous session id
  orders: Order[];
}

const globalForStore = globalThis as unknown as { __store?: Store };

function seed(): Store {
  const users: User[] = [
    {
      id: "u_alice",
      email: "alice@test.com",
      password: "password123",
      name: "Alice",
    },
    {
      id: "u_bob",
      email: "bob@test.com",
      password: "password123",
      name: "Bob",
    },
  ];

  const products: Product[] = [
    {
      id: "p_001",
      name: "Wireless Headphones",
      description: "Over-ear Bluetooth headphones with 30-hour battery life.",
      price: 89.99,
      category: "Electronics",
      color: "bg-indigo-300",
    },
    {
      id: "p_002",
      name: "Mechanical Keyboard",
      description: "Tactile switches, RGB backlight, USB-C.",
      price: 129.0,
      category: "Electronics",
      color: "bg-slate-400",
    },
    {
      id: "p_003",
      name: "USB-C Hub",
      description: "7-in-1 hub: HDMI, SD, USB-A x3, USB-C PD, Ethernet.",
      price: 39.5,
      category: "Electronics",
      color: "bg-zinc-400",
    },
    {
      id: "p_004",
      name: "The Pragmatic Programmer",
      description: "Classic software engineering book by Hunt & Thomas.",
      price: 24.99,
      category: "Books",
      color: "bg-amber-300",
    },
    {
      id: "p_005",
      name: "Clean Code",
      description: "Robert C. Martin on writing maintainable software.",
      price: 29.5,
      category: "Books",
      color: "bg-rose-300",
    },
    {
      id: "p_006",
      name: "Designing Data-Intensive Applications",
      description: "Kleppmann's deep dive into modern data systems.",
      price: 44.0,
      category: "Books",
      color: "bg-emerald-300",
    },
    {
      id: "p_007",
      name: "Cotton T-Shirt",
      description: "Soft 100% cotton tee. Available in standard sizing.",
      price: 19.99,
      category: "Clothing",
      color: "bg-sky-300",
    },
    {
      id: "p_008",
      name: "Hooded Sweatshirt",
      description: "Heavyweight fleece hoodie with kangaroo pocket.",
      price: 49.0,
      category: "Clothing",
      color: "bg-fuchsia-300",
    },
  ];

  return {
    users,
    products,
    carts: new Map(),
    orders: [],
  };
}

export const db: Store = (globalForStore.__store ??= seed());

// Helpers

export function findUserByEmail(email: string): User | undefined {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return db.users.find((u) => u.id === id);
}

export function getProducts(filter?: { q?: string; category?: string }): Product[] {
  let list = db.products.slice();
  if (filter?.category && filter.category !== "All") {
    list = list.filter((p) => p.category === filter.category);
  }
  if (filter?.q) {
    const q = filter.q.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q));
  }
  return list;
}

export function getProductById(id: string): Product | undefined {
  return db.products.find((p) => p.id === id);
}

export function getOrCreateCart(sessionId: string): Cart {
  let cart = db.carts.get(sessionId);
  if (!cart) {
    cart = { sessionId, items: [] };
    db.carts.set(sessionId, cart);
  }
  return cart;
}

export function addToCart(sessionId: string, productId: string, quantity: number): Cart {
  const cart = getOrCreateCart(sessionId);
  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    const item: CartItem = {
      id: `ci_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      productId,
      quantity,
    };
    cart.items.push(item);
  }
  return cart;
}

export function updateCartItem(sessionId: string, itemId: string, quantity: number): Cart | null {
  const cart = db.carts.get(sessionId);
  if (!cart) return null;
  const item = cart.items.find((i) => i.id === itemId);
  if (!item) return null;
  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.id !== itemId);
  } else {
    item.quantity = quantity;
  }
  return cart;
}

export function removeCartItem(sessionId: string, itemId: string): Cart | null {
  const cart = db.carts.get(sessionId);
  if (!cart) return null;
  cart.items = cart.items.filter((i) => i.id !== itemId);
  return cart;
}

export function clearCart(sessionId: string): void {
  const cart = db.carts.get(sessionId);
  if (cart) cart.items = [];
}

export function createOrder(order: Order): Order {
  db.orders.push(order);
  return order;
}

export function getOrdersForUser(userId: string): Order[] {
  return db.orders
    .filter((o) => o.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getOrderById(id: string): Order | undefined {
  return db.orders.find((o) => o.id === id);
}
