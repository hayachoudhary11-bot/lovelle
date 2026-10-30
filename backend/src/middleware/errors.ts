import { ErrorRequestHandler, Response } from "express";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function sendError(res: Response, error: unknown) {
  const value = error as { name?: string; code?: number; status?: number; type?: string };
  if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
  if (value?.code === 11000) return res.status(409).json({ error: "This record already exists" });
  if (["ValidationError", "CastError"].includes(value?.name || "")) return res.status(400).json({ error: "Invalid request data" });
  if (value?.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON body" });
  if (value?.status === 413) return res.status(413).json({ error: "Request body is too large" });
  console.error("Request failed", { type: value?.name || "Error" });
  return res.status(500).json({ error: "Server error" });
}
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => { sendError(res, error); };
