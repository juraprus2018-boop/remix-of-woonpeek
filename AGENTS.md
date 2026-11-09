# Project architecture rules

- Homepage and shared search links use the shared budget parser/serializer; minimum and maximum prices remain explicit across list and map queries and are never cleared by price facets, so searches cannot silently exceed the chosen budget.
- Search and priority rental-city crawlable HTML is written only into dist after bundling; each hub uses one exact-city snapshot (including municipal aliases) for facts and sitemap lastmod, preserves other committed sitemaps, and never fetches the live sitemap generator at buildStart, to avoid stale output and stay below 800 additional HTML files.
- Property summaries derive only from supplied listing fields; missing availability dates and room totals remain unknown, so editorial content and structured data cannot invent rental conditions.

- Public property overview queries share a projection with only the first photo and no raw importer payload; full detail and editor reads remain separate so galleries and editing stay complete.
- Runtime DOM AI translation is disabled on both client and edge endpoint; fixed locale files own UI translations to prevent per-visitor generation costs.
- Admin dashboard property reads use only summary fields and the first photo; paginated editing reads remain complete to avoid loading all listing descriptions for statistics.

- TikTok automation posts recent active rentals as photo carousels by default, uses up to 35 real listing photos, and includes the canonical property URL in every caption, because each social post must lead directly to its listing.- Listing landing pages use one structure, /huurwoningen|koopwoningen/{city}/{filter}; old type/budget/aanbod-in paths redirect there and filter pages are indexed only with enough listings, to avoid duplicate URLs for one search intent.
- Agencies (makelaars) are owned via agencies.owner_user_id, not a role; their feed listings are stored as properties with user_id = owner and agency_id set, so existing property RLS covers editing.
- Agency removal uses an admin-authorized transactional RPC that deactivates associated listings before deleting the agency, preserving property history and the owner's user account.
- Profile creation runs through an idempotent app-owned auth signup trigger so every registered account appears in profile-based user management without assigning privileges from user metadata.

- Listing display orders by the generated provider_priority column before the selected sort, with matching active-listing indexes, so imports and pagination keep a consistent provider preference.

- Explore derives city and source facets from loaded map listings within the viewport or postcode radius, excluding each facet's own selection so users can switch filters without extra nationwide queries.
- Shared Logo renders the uploaded color or light CDN asset, while favicon and installed-app icons remain local public files, so every placement uses the supplied identity without duplicating artwork.
- The alert-digest template owns its email layout and theme separately from other transactional emails, so housing-mail redesigns cannot alter authentication, contact or welcome messages.
- Press publications store optional editorial image metadata and a related blog slug in their existing data object, so rich releases remain compatible with automated releases without schema changes.
- City rental insights share a paginated exact-city active-rental query and pure statistical calculation across city and canonical rental routes, with attributed local context and explicit samples, so price comparisons never mix sales or silently truncated listing data.
- Facebook captions and link attachments share the edge-function listing URL helper, including daily video captions, so every posting path follows the same destination rule.
