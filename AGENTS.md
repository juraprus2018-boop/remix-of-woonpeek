# Project architecture rules

- TikTok automation posts recent active rentals as photo carousels by default, uses up to 35 real listing photos, and includes the canonical property URL in every caption, because each social post must lead directly to its listing.- Listing landing pages use one structure, /huurwoningen|koopwoningen/{city}/{filter}; old type/budget/aanbod-in paths redirect there and filter pages are indexed only with enough listings, to avoid duplicate URLs for one search intent.
- Agencies (makelaars) are owned via agencies.owner_user_id, not a role; their feed listings are stored as properties with user_id = owner and agency_id set, so existing property RLS covers editing.
- Agency removal uses an admin-authorized transactional RPC that deactivates associated listings before deleting the agency, preserving property history and the owner's user account.
- Profile creation runs through an idempotent app-owned auth signup trigger so every registered account appears in profile-based user management without assigning privileges from user metadata.

- Listing display orders by the generated provider_priority column before the selected sort, with matching active-listing indexes, so imports and pagination keep a consistent provider preference.

- Explore derives city and source facets from loaded map listings within the viewport or postcode radius, excluding each facet's own selection so users can switch filters without extra nationwide queries.
