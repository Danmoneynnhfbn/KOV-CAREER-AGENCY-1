import { DurableObject } from "cloudflare:workers";

interface Env {
  KOV_BACKEND: DurableObjectNamespace<KOVBackend>;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  ADMIN_USER_ID?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_EMPLOYER_MONTHLY_PRICE_ID?: string;
  STRIPE_BILLING_ENABLED?: string;
  KOV_COOKIE_SECURE?: string;
  SUPABASE_CV_BUCKET?: string;
  CRON_SECRET?: string;
}

const CONTAINER_ENV_NAMES = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_USER_ID",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_EMPLOYER_MONTHLY_PRICE_ID",
  "STRIPE_BILLING_ENABLED",
  "KOV_COOKIE_SECURE",
  "SUPABASE_CV_BUCKET",
  "CRON_SECRET",
] as const;

const CONTAINER_PORT = 8000;
const HEALTH_URL = "http://container/health";

export class KOVBackend extends DurableObject<Env> {
  private readonly runtimeEnv: Env;
  private startup: Promise<void> | undefined;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.runtimeEnv = env;
  }

  private containerEnvironment(): Record<string, string> {
    const values: Record<string, string> = {};
    for (const name of CONTAINER_ENV_NAMES) {
      const value = this.runtimeEnv[name];
      if (typeof value === "string" && value.length > 0) {
        values[name] = value;
      }
    }
    return values;
  }

  private async ensureContainerReady(): Promise<void> {
    const container = this.ctx.container!;
    if (!container.running) {
      this.startup = undefined;
    }

    if (!this.startup) {
      this.startup = (async () => {
        if (!container.running) {
          await container.start({
            env: this.containerEnvironment(),
            enableInternet: true,
          });
        }

        const port = container.getTcpPort(CONTAINER_PORT);
        let lastError: unknown;

        for (let attempt = 0; attempt < 60; attempt += 1) {
          try {
            const response = await port.fetch(HEALTH_URL);
            if (response.ok) return;
            lastError = new Error(`Container health check returned HTTP ${response.status}`);
          } catch (error) {
            lastError = error;
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        throw new Error("KOV application container did not become ready on port 8000", {
          cause: lastError,
        });
      })().catch((error) => {
        this.startup = undefined;
        throw error;
      });
    }

    await this.startup;
  }

  async fetch(request: Request): Promise<Response> {
    try {
      await this.ensureContainerReady();
    } catch (error) {
      console.error("KOV container startup failed", error);
      return Response.json(
        { detail: "The KOV application service is temporarily unavailable." },
        { status: 503 },
      );
    }

    const incomingUrl = new URL(request.url);
    const targetUrl = new URL(incomingUrl.pathname + incomingUrl.search, "http://container");
    const headers = new Headers(request.headers);

    // The container sees an internal hostname. These values preserve the
    // original public host/protocol for same-origin checks and redirects.
    headers.set("x-forwarded-host", incomingUrl.host);
    headers.set("x-forwarded-proto", incomingUrl.protocol.slice(0, -1));
    const clientIp = request.headers.get("cf-connecting-ip");
    if (clientIp) headers.set("x-real-ip", clientIp);

    const init: RequestInit = {
      method: request.method,
      headers,
      redirect: "manual",
    };
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
    }

    const forwarded = new Request(targetUrl, init);
    return this.ctx.container!.getTcpPort(CONTAINER_PORT).fetch(forwarded);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.KOV_BACKEND.getByName("production").fetch(request);
  },
};
