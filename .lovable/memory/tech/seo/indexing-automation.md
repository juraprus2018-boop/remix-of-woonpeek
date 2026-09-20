---
name: indexing-automation
description: Google Indexing API aanmelding van nieuwe woningen via google-indexing edge function
type: reference
---
# Google Indexing automation
- Edge function `google-indexing` (cron jobid 10, `0 7 * * *`, x-cron-secret) meldt dagelijks nieuwe/bijgewerkte URL's aan bij Google Indexing API.
- Selecteert properties op `updated_at` laatste 24u (niet alleen created_at) + nieuwe blogposts (/blog/{slug}) + stadspagina's van steden met vers aanbod.
- Max 190 submits per run (Indexing API dagquota = 200); stopt bij 403/429.
- GOOGLE_SERVICE_ACCOUNT_JSON bevat nog een PLACEHOLDER → functie geeft nu duidelijke NL-foutmelding. Wacht op echte Service Account JSON (Indexing API activeren + SA-e-mail als eigenaar in Search Console).
- Logt elke submit in `google_indexing_log`.
- Nieuwe woningen gaan ook direct naar IndexNow vanuit de import-functies (Bing e.d.).
