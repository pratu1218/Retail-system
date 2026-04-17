const QUEUE_KEY = "retailpro_offline_queue";

export const saveToQueue = (transaction) => {
  const queue = getQueue();
  queue.push({ ...transaction, queuedAt: new Date().toISOString() });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const getQueue = () => {
  return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
};

export const clearQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
};

export const getQueueCount = () => getQueue().length;