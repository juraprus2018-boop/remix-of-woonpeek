import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

/**
 * Shared SMTP configuration.
 *
 * The mail for woonaanbod-nl.nl is hosted at Strato, whose outgoing mail server
 * is smtp.strato.com. Connecting to woonaanbod-nl.nl / mail.woonaanbod-nl.nl
 * times out (those point at the web host, not the mail host), which previously
 * caused every outgoing email to fail with "Connection timed out".
 * Both host and port can be overridden with secrets if the provider changes.
 */
export const SMTP_HOST = Deno.env.get("SMTP_HOST") || "smtp.strato.com";
export const SMTP_PORT = Number(Deno.env.get("SMTP_PORT") || "465");
export const SMTP_USER = Deno.env.get("SMTP_USER") || "info@woonaanbod-nl.nl";
export const MAIL_FROM = `Woonaanbod NL <${SMTP_USER}>`;

export function createSmtpClient(): SMTPClient {
  return new SMTPClient({
    connection: {
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      tls: SMTP_PORT === 465,
      auth: {
        username: SMTP_USER,
        password: Deno.env.get("SMTP_PASSWORD") || "",
      },
    },
  });
}

/** Close an SMTP client without letting a never-opened connection throw. */
export async function closeSmtpQuietly(client: SMTPClient | null) {
  if (!client) return;
  try {
    await client.close();
  } catch (err) {
    console.warn("SMTP close failed (ignored):", err instanceof Error ? err.message : err);
  }
}

export type { SMTPClient };
