# Project architecture rules

- Direct Renthunter CSV sync owns its source lifecycle and uses validated, service-role-only bulk batches matched by listing ID, preserving existing property URLs and deactivating missing rows only after a complete successful feed import.

- TikTok automation posts recent active rentals as photo carousels by default, uses up to 35 real listing photos, and includes the canonical property URL in every caption, because each social post must lead directly to its listing.- Listing landing pages use one structure, /huurwoningen|koopwoningen/{city}/{filter}; old type/budget/aanbod-in paths redirect there and filter pages are indexed only with enough listings, to avoid duplicate URLs for one search intent.
- Agencies (makelaars) are owned via agencies.owner_user_id, not a role; their feed listings are stored as properties with user_id = owner and agency_id set, so existing property RLS covers editing.
- Agency removal uses an admin-authorized transactional RPC that deactivates associated listings before deleting the agency, preserving property history and the owner's user account.
- Profile creation runs through an idempotent app-owned auth signup trigger so every registered account appears in profile-based user management without assigning privileges from user metadata.

- Listing display orders by the generated provider_priority column before the selected sort, with matching active-listing indexes, so imports and pagination keep a consistent provider preference.

- Explore derives city and source facets from loaded map listings within the viewport or postcode radius, excluding each facet's own selection so users can switch filters without extra nationwide queries.
- Explore loads public active coordinate-bearing listings through one compact security-invoker snapshot RPC, cached independently of filters and sort, so nationwide markers are not repeatedly downloaded or silently capped by pagination.
- Shared Logo renders the uploaded color or light CDN asset, while favicon and installed-app icons remain local public files, so every placement uses the supplied identity without duplicating artwork.
- The alert-digest template owns its email layout and theme separately from other transactional emails, so housing-mail redesigns cannot alter authentication, contact or welcome messages.
- Press publications store optional editorial image metadata and a related blog slug in their existing data object, so rich releases remain compatible with automated releases without schema changes.
- City rental insights share a paginated exact-city active-rental query and pure statistical calculation across city and canonical rental routes, with attributed local context and explicit samples, so price comparisons never mix sales or silently truncated listing data.
- Facebook daily videos render actual MP4s and persist one job per Amsterdam calendar day with atomic write claims and remote IDs; only ready videos with completed publishing count as posted, and unknown upload outcomes require reconciliation before retry.
