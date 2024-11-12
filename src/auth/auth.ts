import type { Client } from "../client.ts";
import { ErrorResponse } from "../error/error-response.ts";

export const enum Provider {
  Google = "Google",
  Github = "Github",
  Email = "Email",
}

type Response = { data?: User | null; error?: ErrorResponse | null };

type User = {
  id: string;
  name: string;
};

export class Auth {
  constructor(private client: Client) {}

  public async signWithIdToken({
    provider,
    idToken,
  }: {
    provider: Provider;
    idToken: string;
  }): Promise<Response> {
    switch (provider) {
      case Provider.Google: {
        return await this.googleExchangeIdToken(idToken);
      }
      default:
        throw new Error("not implements");
    }
  }

  private async googleExchangeIdToken(idToken: string) {
    const resultFetch = await fetch(`${this.client.url}/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apiKey: this.client.apiKey,
      },
      body: JSON.stringify({ provider: Provider.Google, idToken }),
    });

    const data = await resultFetch.json();

    if (resultFetch.ok) {
      return { data: data as User, error: null };
    } else {
      return { data: null, error: data };
    }
  }
}
