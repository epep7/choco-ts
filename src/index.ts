import { Client } from "./client.ts";

export * from "./auth/auth.ts"
export * from "./query/query-builder.ts"
export * from "./error/error-response.ts";

export function createChocoClient(apiKey: string, url: string) {
  return new Client(apiKey, url)
}
