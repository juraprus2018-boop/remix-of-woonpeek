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


export function createSmtpClient(port: number = SMTP_PORT): SMTPClient {
  return new SMTPClient({
    connection: {
      hostname: SMTP_HOST,
      port,
      tls: port === 465,
      auth: {
        username: SMTP_USER,
        password: Deno.env.get("SMTP_PASSWORD") || "",
      },
    },
  });
}

/**
 * Ports to try, in order. The edge runtime sometimes cannot route implicit-TLS
 * port 465 ("No route to host"), so fall back to STARTTLS 587 and plain 25.
 */
const FALLBACK_PORTS = [SMTP_PORT, 587, 25].filter(
  (port, index, all) => all.indexOf(port) === index,
);

type MailMessage = Parameters<SMTPClient["send"]>[0];

/**
 * Send one message, retrying on the fallback ports when the connection itself
 * fails. Throws the last error when every port is unreachable.
 */
export async function sendMail(message: MailMessage): Promise<number> {
  let lastError: unknown;
  for (const port of FALLBACK_PORTS) {
    const client = createSmtpClient(port);
    try {
      await client.send(message);
      await closeSmtpQuietly(client);
      return port;
    } catch (err) {
      lastError = err;
      await closeSmtpQuietly(client);
      console.warn(
        `SMTP send via ${SMTP_HOST}:${port} failed: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
  throw lastError instanceof Error ? lastError : new Error("SMTP send failed on all ports");
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
