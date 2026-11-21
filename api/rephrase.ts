import type { IncomingMessage, ServerResponse } from "node:http";
import { handleRephraseRequest, type RephraseBody } from "../rephraseService.ts";

interface RequestWithBody extends IncomingMessage {
  body?: unknown;
}

async function readJsonBody(req: RequestWithBody): Promise<RephraseBody> {
  if (req.body && typeof req.body === "object") {
    return req.body as RephraseBody;
  }
  if (typeof req.body === "string" && req.body.trim()) {
    return JSON.parse(req.body) as RephraseBody;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  return JSON.parse(raw) as RephraseBody;
}

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

export default async function handler(
  req: RequestWithBody,
  res: ServerResponse
): Promise<void> {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed. Use POST /api/rephrase." });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const result = await handleRephraseRequest(body);
    sendJson(res, result.status, result.payload);
  } catch (err) {
    const message =
      err instanceof SyntaxError
        ? "Invalid JSON request body."
        : err instanceof Error
          ? err.message
          : "Unexpected error processing rewrite request.";
    sendJson(res, 400, { error: message });
  }
}
