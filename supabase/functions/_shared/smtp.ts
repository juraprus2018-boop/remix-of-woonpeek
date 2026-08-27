import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

/**
 * Shared SMTP configuration.
 *
 * Mail voor woonaanbod-nl.nl loopt via de eigen mailserver
 * mail.woonaanbod-nl.nl (SSL/TLS op poort 465, STARTTLS op 587).
 * Host, poort en gebruiker zijn te overschrijven met secrets.
 */
export const SMTP_HOST = Deno.env.get("SMTP_HOST") || "mail.woonaanbod-nl.nl";
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
