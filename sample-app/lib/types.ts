export type Category = "Electronics" | "Books" | "Clothing";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  color: string; // tailwind bg class for the placeholder
}

export interface User {
  id: string;
  email: string;
  password: string; // plain text - this is a learning sandbox, not production
  name: string;
}

export type PublicUser = Omit<User, "password">;

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

export interface Cart {
  sessionId: string;
  items: CartItem[];
}

export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface PaymentDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export type OrderStatus = "Placed" | "Shipped" | "Delivered";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: ShippingAddress;
  // Payment we only store last4 — never real card numbers.
  paymentLast4: string;
  status: OrderStatus;
  createdAt: string; // ISO
}
