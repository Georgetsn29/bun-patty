import { ORDER_TRACKING_CONFIG } from './orderConfig';
import { useSyncExternalStore, useMemo } from 'react';

function subscribeToLiveClock(callback: () => void) {
  let intervalId: NodeJS.Timeout | null = null;

  const startTimer = () => {
    if (!intervalId && typeof document !== 'undefined' && !document.hidden) {
      intervalId = setInterval(callback, 1000);
    }
  };

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopTimer();
    } else {
      callback();
      startTimer();
    }
  };

  startTimer();
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  return () => {
    stopTimer();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };
}

function getLiveClockSnapshot(): number {
  return Math.floor(Date.now() / 1000) * 1000;
}

function getServerClockSnapshot(): number {
  return 0;
}

/**
 * Idiomatic React hook to subscribe to live time updates without impure render calls or cascading effects
 */
export function useLiveTimestamp(): number {
  return useSyncExternalStore(subscribeToLiveClock, getLiveClockSnapshot, getServerClockSnapshot);
}

export type OrderStatus =
  | 'received'
  | 'preparing'
  | 'on_the_grill'
  | 'almost_ready'
  | 'ready'
  | 'out_for_delivery'
  | 'ready_for_pickup'
  | 'delivered'
  | 'picked_up'
  | 'cancelled';

export interface OrderItemCustomization {
  selectedChoiceId?: string;
  removedIngredientIds?: string[];
  extraQuantities?: Record<string, number>;
  notes?: string;
}

export interface OrderItemRecord {
  itemId: string; // Stable ID, e.g. "peach-blossom-smash"
  quantity: number;
  unitPrice: number;
  customization?: OrderItemCustomization;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: number;
}

export interface OrderRecord {
  orderNumber: string; // Short readable ID, e.g. "PP-4827"
  createdAt: number; // Timestamp in milliseconds
  startTime?: number; // Starting timestamp (ms)
  finishTime?: number; // Target completion timestamp (ms)
  estimatedMinutes?: number; // Total estimated prep turnaround in minutes
  orderType: 'delivery' | 'pickup';
  customerName: string;
  phone: string;
  email: string;
  address?: string;
  apartment?: string;
  instructions?: string;
  pickupLocationId?: string;
  items: OrderItemRecord[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  tipAmount: number;
  grandTotal: number;
  statusHistory: StatusHistoryEntry[];
  cancelledAt?: number;
  pickedUpAt?: number;
}

export interface StatusTimelineStep {
  status: OrderStatus;
  labelKey: string;
  messageKey: string;
  scheduledTime: number; // Timestamp when this step occurred/will occur
  isCompleted: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
}

export interface OrderProgressDetails {
  currentStatus: OrderStatus;
  statusLabelKey: string;
  statusMessageKey: string;
  startTime: number;
  finishTime: number;
  totalDurationMs: number;
  elapsedMs: number;
  progressRatio: number; // 0.0 to 1.0
  progressPercentage: number; // 0 to 100
  remainingMs: number;
  remainingMinutes: number;
  remainingSeconds: number;
  formattedRemainingCountdown: string; // MM:SS format, e.g. "30:00"
  formattedRemainingEstimate: string; // "~30 min", "~18 min", "0 min"
  estimatedTargetTime: number; // Target finish timestamp (ms)
  isDeliveredOrPickedUp: boolean;
  isReadyOrFinished: boolean;
  isCancelled: boolean;
  canCancel: boolean;
  timelineSteps: StatusTimelineStep[];
}

/**
 * Generate a short, readable order number such as BP-4827
 */
export function generateOrderNumber(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `BP-${digits}`;
}

const savedOrdersListeners = new Set<() => void>();

function notifyOrdersChanged() {
  savedOrdersListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}

function subscribeToSavedOrders(callback: () => void) {
  savedOrdersListeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === ORDER_TRACKING_CONFIG.storageKey) {
      callback();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    savedOrdersListeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

let cachedRawOrders: string | null = null;
let cachedOrders: OrderRecord[] = [];

function getSavedOrdersSnapshot(): OrderRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    let raw = localStorage.getItem(ORDER_TRACKING_CONFIG.storageKey);
    if (!raw) {
      const legacyRaw = localStorage.getItem('pp_orders_v1');
      if (legacyRaw) {
        raw = legacyRaw;
        try {
          localStorage.setItem(ORDER_TRACKING_CONFIG.storageKey, legacyRaw);
        } catch {
          // ignore
        }
      }
    }
    if (raw === cachedRawOrders) {
      return cachedOrders;
    }
    cachedRawOrders = raw;
    cachedOrders = raw ? JSON.parse(raw) : [];
    return cachedOrders;
  } catch {
    return [];
  }
}

const emptyOrders: OrderRecord[] = [];
function getServerOrdersSnapshot(): OrderRecord[] {
  return emptyOrders;
}

/**
 * Idiomatic React hook to subscribe to saved orders without cascading renders
 */
export function useSavedOrders(): OrderRecord[] {
  return useSyncExternalStore(subscribeToSavedOrders, getSavedOrdersSnapshot, getServerOrdersSnapshot);
}

/**
 * Load all stored orders from localStorage (safely handles SSR)
 */
export function getSavedOrders(): OrderRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    let raw = localStorage.getItem(ORDER_TRACKING_CONFIG.storageKey);
    if (!raw) {
      const legacyRaw = localStorage.getItem('pp_orders_v1');
      if (legacyRaw) {
        raw = legacyRaw;
        try {
          localStorage.setItem(ORDER_TRACKING_CONFIG.storageKey, legacyRaw);
        } catch {
          // ignore
        }
      }
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to parse saved orders from localStorage:', err);
    return [];
  }
}

/**
 * Save an order to localStorage, keeping up to maxRecentOrders (default 10)
 */
export function saveOrder(order: OrderRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getSavedOrders();
    // Remove if already exists with same orderNumber (for updates)
    const filtered = existing.filter((o) => o.orderNumber !== order.orderNumber);
    // Prepend new/updated order
    const updated = [order, ...filtered].slice(0, ORDER_TRACKING_CONFIG.maxRecentOrders);
    localStorage.setItem(ORDER_TRACKING_CONFIG.storageKey, JSON.stringify(updated));
    notifyOrdersChanged();
  } catch (err) {
    console.error('Failed to save order to localStorage:', err);
  }
}

/**
 * Retrieve a specific order by orderNumber
 */
export function getOrderByNumber(orderNumber: string): OrderRecord | null {
  if (!orderNumber) return null;
  const cleanQuery = orderNumber.trim().toUpperCase().replace(/^#/, '');
  const orders = getSavedOrders();
  const match = orders.find(
    (o) =>
      o.orderNumber.toUpperCase() === cleanQuery ||
      o.orderNumber.toUpperCase().replace(/^PP-/, 'BP-') === cleanQuery ||
      o.orderNumber.toUpperCase().replace(/^BP-/, 'PP-') === cleanQuery
  );
  return match || null;
}

/**
 * Search for an order by order number and optional phone number
 */
export function findOrder(queryOrderNumber: string, queryPhone?: string): OrderRecord | null {
  if (!queryOrderNumber) return null;
  const cleanNum = queryOrderNumber.trim().toUpperCase().replace(/^#/, '');
  const cleanPhone = queryPhone ? queryPhone.replace(/\D/g, '') : '';

  const orders = getSavedOrders();
  for (const o of orders) {
    const matchesNum =
      o.orderNumber.toUpperCase() === cleanNum ||
      o.orderNumber.toUpperCase().replace(/^PP-/, 'BP-') === cleanNum ||
      o.orderNumber.toUpperCase().replace(/^BP-/, 'PP-') === cleanNum;
    if (matchesNum) {
      if (!cleanPhone) {
        return o;
      }
      const orderPhoneDigits = o.phone.replace(/\D/g, '');
      if (orderPhoneDigits.endsWith(cleanPhone) || cleanPhone.endsWith(orderPhoneDigits)) {
        return o;
      }
    }
  }

  return null;
}

/**
 * Calculate the live order status and detailed timeline based on saved start and finish times
 * using percentage of time passed:
 * - Order received: 0-10%
 * - Preparing: 10-40%
 * - On the grill: 40-85%
 * - Almost ready: 85-100%
 * - Ready: 100%
 */
export function calculateOrderProgress(
  order: OrderRecord,
  currentTime: number = 0
): OrderProgressDetails {
  const effectiveTime = currentTime > 0 ? currentTime : order.createdAt;
  const startTime = order.startTime || order.createdAt;
  const estimatedMinutes = order.estimatedMinutes || 30;
  const finishTime = order.finishTime || (startTime + estimatedMinutes * 60 * 1000);
  const totalDurationMs = Math.max(1000, finishTime - startTime);

  // Speed multiplier for testing (default 1)
  const speed = ORDER_TRACKING_CONFIG.speedMultiplier || 1;
  const elapsedMs = Math.max(0, (effectiveTime - startTime) * speed);
  const progressRatio = Math.min(1.0, Math.max(0, elapsedMs / totalDurationMs));
  const progressPercentage = Math.round(progressRatio * 100);

  const remainingMs = Math.max(0, Math.round((finishTime - (startTime + elapsedMs)) / speed));
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  // Format MM:SS for countdown clock
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  const formattedRemainingCountdown = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  // Format "~30 min" for estimate
  const formattedRemainingEstimate =
    remainingMinutes <= 0
      ? '0 min'
      : `~${remainingMinutes} min`;

  // Determine cancelled state
  if (order.cancelledAt) {
    return {
      currentStatus: 'cancelled',
      statusLabelKey: 'tracking.status.cancelled',
      statusMessageKey: 'tracking.message.cancelled',
      startTime,
      finishTime,
      totalDurationMs,
      elapsedMs,
      progressRatio,
      progressPercentage,
      remainingMs: 0,
      remainingMinutes: 0,
      remainingSeconds: 0,
      formattedRemainingCountdown: '00:00',
      formattedRemainingEstimate: '0 min',
      estimatedTargetTime: order.cancelledAt,
      isDeliveredOrPickedUp: false,
      isReadyOrFinished: false,
      isCancelled: true,
      canCancel: false,
      timelineSteps: [],
    };
  }

  // Base the order tracking statuses on percentage of time passed:
  // - Order received: 0-10%
  // - Preparing: 10-40%
  // - On the grill: 40-85%
  // - Almost ready: 85-100%
  // - Ready: 100%
  let currentStatus: OrderStatus = 'received';
  if (progressRatio >= 1.0) {
    currentStatus = order.pickedUpAt ? 'picked_up' : 'ready';
  } else if (progressRatio >= 0.85) {
    currentStatus = 'almost_ready';
  } else if (progressRatio >= 0.40) {
    currentStatus = 'on_the_grill';
  } else if (progressRatio >= 0.10) {
    currentStatus = 'preparing';
  } else {
    currentStatus = 'received';
  }

  const isReadyOrFinished = progressRatio >= 1.0 || Boolean(order.pickedUpAt);
  const isDeliveredOrPickedUp = isReadyOrFinished;
  const canCancel = currentStatus === 'received';

  // Planned step timestamps
  const receivedTime = startTime;
  const preparingTime = startTime + totalDurationMs * 0.10;
  const onTheGrillTime = startTime + totalDurationMs * 0.40;
  const almostReadyTime = startTime + totalDurationMs * 0.85;
  const readyTime = finishTime;

  const rawSteps: Array<{
    status: OrderStatus;
    labelKey: string;
    messageKey: string;
    scheduledTime: number;
    threshold: number;
  }> = [
    {
      status: 'received',
      labelKey: 'tracking.status.received',
      messageKey: 'tracking.message.received',
      scheduledTime: receivedTime,
      threshold: 0.0,
    },
    {
      status: 'preparing',
      labelKey: 'tracking.status.preparing',
      messageKey: 'tracking.message.preparing',
      scheduledTime: preparingTime,
      threshold: 0.10,
    },
    {
      status: 'on_the_grill',
      labelKey: 'tracking.status.onTheGrill',
      messageKey: 'tracking.message.onTheGrill',
      scheduledTime: onTheGrillTime,
      threshold: 0.40,
    },
    {
      status: 'almost_ready',
      labelKey: 'tracking.status.almostReady',
      messageKey: 'tracking.message.almostReady',
      scheduledTime: almostReadyTime,
      threshold: 0.85,
    },
    {
      status: 'ready',
      labelKey: order.orderType === 'delivery' ? 'tracking.status.delivered' : 'tracking.status.ready',
      messageKey: order.orderType === 'delivery' ? 'tracking.message.delivered' : 'tracking.message.ready',
      scheduledTime: readyTime,
      threshold: 1.0,
    },
  ];

  const currentIndex = rawSteps.findIndex((s) => s.status === currentStatus);
  const activeIndex = currentIndex >= 0 ? currentIndex : (isReadyOrFinished ? 4 : 0);

  const timelineSteps: StatusTimelineStep[] = rawSteps.map((step, idx) => ({
    status: step.status,
    labelKey: step.labelKey,
    messageKey: step.messageKey,
    scheduledTime: Math.round(step.scheduledTime),
    isCompleted: idx < activeIndex || (idx === activeIndex && isReadyOrFinished),
    isCurrent: idx === activeIndex && !isReadyOrFinished,
    isUpcoming: idx > activeIndex,
  }));

  const activeStep = timelineSteps[activeIndex] || timelineSteps[0];

  return {
    currentStatus,
    statusLabelKey: activeStep.labelKey,
    statusMessageKey: activeStep.messageKey,
    startTime,
    finishTime,
    totalDurationMs,
    elapsedMs,
    progressRatio,
    progressPercentage,
    remainingMs,
    remainingMinutes,
    remainingSeconds,
    formattedRemainingCountdown,
    formattedRemainingEstimate,
    estimatedTargetTime: finishTime,
    isDeliveredOrPickedUp,
    isReadyOrFinished,
    isCancelled: false,
    canCancel,
    timelineSteps,
  };
}

/**
 * Cancel an order (only permitted during "Order received")
 */
export function cancelOrder(orderNumber: string): OrderRecord | null {
  const order = getOrderByNumber(orderNumber);
  if (!order) return null;

  const progress = calculateOrderProgress(order);
  if (!progress.canCancel) {
    return null; // Not allowed to cancel after prep has started
  }

  const cancelledTimestamp = Date.now();
  const updatedOrder: OrderRecord = {
    ...order,
    cancelledAt: cancelledTimestamp,
    statusHistory: [
      ...order.statusHistory,
      { status: 'cancelled', timestamp: cancelledTimestamp },
    ],
  };

  saveOrder(updatedOrder);
  return updatedOrder;
}

/**
 * Mark a pickup order as picked up by the customer
 */
export function confirmOrderPickup(orderNumber: string): OrderRecord | null {
  const order = getOrderByNumber(orderNumber);
  if (!order || order.orderType !== 'pickup') return null;

  const pickupTimestamp = Date.now();
  const updatedOrder: OrderRecord = {
    ...order,
    pickedUpAt: pickupTimestamp,
    statusHistory: [
      ...order.statusHistory,
      { status: 'picked_up', timestamp: pickupTimestamp },
    ],
  };

  saveOrder(updatedOrder);
  return updatedOrder;
}

/**
 * Get dismissed order numbers for the home card
 */
export function getDismissedHomeOrderNumbers(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDER_TRACKING_CONFIG.dismissedOrdersKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Dismiss an order from the Home page card ("Got it" action)
 */
export function dismissOrderFromHome(orderNumber: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getDismissedHomeOrderNumbers();
    if (!current.includes(orderNumber)) {
      const updated = [...current, orderNumber];
      localStorage.setItem(ORDER_TRACKING_CONFIG.dismissedOrdersKey, JSON.stringify(updated));
      notifyOrdersChanged();
    }
  } catch (err) {
    console.error('Failed to dismiss order from home:', err);
  }
}

/**
 * Get all active orders on this device:
 * - Excludes cancelled
 * - Excludes orders dismissed via "Got it"
 * - Excludes completed orders after 2 hours
 * - Sorted by finishTime ascending (finishing soonest first)
 */
export function getActiveOrders(currentTime: number = 0, sourceOrders?: OrderRecord[]): OrderRecord[] {
  const orders = sourceOrders || getSavedOrders();
  if (!orders.length) return [];

  const now = currentTime > 0 ? currentTime : Date.now();
  const maxHideMs = ORDER_TRACKING_CONFIG.completedOrderHideHours * 60 * 60 * 1000;
  const dismissed = getDismissedHomeOrderNumbers();

  const active = orders.filter((o) => {
    // Exclude cancelled
    if (o.cancelledAt) return false;
    // Exclude customer dismissed
    if (dismissed.includes(o.orderNumber)) return false;

    const startTime = o.startTime || o.createdAt;
    const estimatedMinutes = o.estimatedMinutes || 30;
    const finishTime = o.finishTime || (startTime + estimatedMinutes * 60 * 1000);

    // Filter out orders older than 24 hours
    if (now - startTime > 24 * 60 * 60 * 1000) return false;

    // Automatically hide completed orders 2 hours after they are ready
    if (now >= finishTime) {
      if (now - finishTime > maxHideMs) {
        return false;
      }
    }

    return true;
  });

  // Sort with order finishing soonest first
  active.sort((a, b) => {
    const aFinish = a.finishTime || (a.startTime || a.createdAt) + (a.estimatedMinutes || 30) * 60000;
    const bFinish = b.finishTime || (b.startTime || b.createdAt) + (b.estimatedMinutes || 30) * 60000;
    return aFinish - bFinish;
  });

  return active;
}

/**
 * Get single primary active order (finishing soonest) for banner or card
 */
export function getActiveOrder(currentTime: number = 0): OrderRecord | null {
  const active = getActiveOrders(currentTime);
  return active[0] || null;
}

/**
 * Reactive hook returning all active orders, reacting to saved orders changes and clock ticks
 */
export function useActiveOrders(): OrderRecord[] {
  const allOrders = useSavedOrders();
  const now = useLiveTimestamp();
  return useMemo(() => {
    return getActiveOrders(now, allOrders);
  }, [allOrders, now]);
}

/**
 * Format timestamp in strict 24-hour time "HH:mm" (e.g. 21:45)
 */
export function format24HourTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format timestamp in strict date format "DD.MM.YYYY" (e.g. 09.11.2026)
 */
export function formatEuropeanDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}
