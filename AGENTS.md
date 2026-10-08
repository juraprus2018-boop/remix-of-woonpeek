# Project architecture rules

- TikTok automation posts recent active rentals as photo carousels by default, uses up to 35 real listing photos, and includes the canonical property URL in every caption, because each social post must lead directly to its listing.- Listing landing pages use one structure, /huurwoningen|koopwoningen/{city}/{filter}; old type/budget/aanbod-in paths redirect there and filter pages are indexed only with enough listings, to avoid duplicate URLs for one search intent.
- Agencies (makelaars) are owned via agencies.owner_user_id, not a role; their feed listings are stored as properties with user_id = owner and agency_id set, so existing property RLS covers editing.

- Listing display orders by the generated provider_priority column before the selected sort, with matching active-listing indexes, so imports and pagination keep a consistent provider preference.
