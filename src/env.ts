const NODE_ENV = process.env.NODE_ENV ?? "development"; // fallback
export const isProd = ["production", "product", "stage"].includes(NODE_ENV);
export const isDev = NODE_ENV === "development";
