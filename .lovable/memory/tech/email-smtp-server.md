---
name: SMTP mailserver
description: E-mail verzending loopt via eigen mailserver mail.woonaanbod-nl.nl (SSL/TLS 465), niet via Strato of externe providers
type: feature
---

Alle uitgaande mail (edge functions, via `supabase/functions/_shared/smtp.ts`) gaat via de eigen mailserver:

- Host: `mail.woonaanbod-nl.nl` (secret `SMTP_HOST`)
- Poort: 465 SSL/TLS (alternatief STARTTLS 587, geen encryptie 25) via `SMTP_PORT`
- Gebruiker: `info@woonaanbod-nl.nl` (`SMTP_USER`), wachtwoord in `SMTP_PASSWORD`
- Webmail: webmail.woonaanbod-nl.nl

NIET wisselen naar Strato (smtp.strato.com) of een externe e-mailprovider. Na wijziging in `_shared/smtp.ts` altijd alle mail-functies opnieuw deployen.
