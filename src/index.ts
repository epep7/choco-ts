import { Client } from "./client.ts";

export function createChocoClient(apiKey: string, url: string) {
  return new Client(apiKey, url)
}
