import type { ComponentType } from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome.tsx'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as welcome } from './welcome.tsx'
import { template as propertyContact } from './property-contact.tsx'
import { template as agencyWelcome } from './agency-welcome.tsx'
import { template as alertDigest } from './alert-digest.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome': welcome,
  'property-contact': propertyContact,
  'agency-welcome': agencyWelcome,
  'alert-digest': alertDigest,
  // Add templates here as they are created, e.g.:
  // 'welcome': welcomeTemplate,
}
