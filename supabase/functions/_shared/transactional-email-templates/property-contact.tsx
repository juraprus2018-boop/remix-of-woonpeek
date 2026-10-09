import * as React from 'npm:react@18.3.1'
import { Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { Layout, H1, P } from './layout.tsx'

interface Props {
  propertyTitle?: string
  address?: string
  senderName?: string
  senderEmail?: string
  senderPhone?: string
  message?: string
  isCopy?: boolean
}

const PropertyContact = ({ propertyTitle, address, senderName, senderEmail, senderPhone, message, isCopy }: Props) => (
  <Layout preview={`Nieuw bericht over ${propertyTitle || 'je woning'}`}>
    <H1>{isCopy ? 'Kopie: contactbericht' : 'Nieuw bericht over je woning'}</H1>
    <P>Er is een bericht binnengekomen over <strong>{propertyTitle || 'je woning'}</strong>{address ? ` (${address})` : ''}.</P>
    <Section style={{ backgroundColor: '#f4f7fb', borderRadius: '10px', padding: '14px 18px', margin: '0 0 16px' }}>
      <Text style={{ margin: '0 0 6px', fontSize: '14px', color: '#0f172a' }}><strong>Van:</strong> {senderName} ({senderEmail})</Text>
      {senderPhone ? <Text style={{ margin: '0 0 6px', fontSize: '14px', color: '#0f172a' }}><strong>Telefoon:</strong> {senderPhone}</Text> : null}
      <Text style={{ margin: '8px 0 0', fontSize: '14px', color: '#334155', whiteSpace: 'pre-wrap' as const }}>{message}</Text>
    </Section>
    <P>Antwoord op deze e-mail om direct te reageren aan {senderName || 'de afzender'}.</P>
  </Layout>
)

export const template = {
  component: PropertyContact,
  subject: (d: Record<string, any>) => `${d.isCopy ? '[Kopie] ' : ''}Nieuw bericht over: ${d.propertyTitle || 'je woning'}`,
  displayName: 'Contactformulier woning',
  previewData: { propertyTitle: 'Appartement in Rotterdam', address: 'Coolsingel 10, Rotterdam', senderName: 'Sanne de Vries', senderEmail: 'sanne@example.com', senderPhone: '0612345678', message: 'Hallo, ik heb interesse in deze woning. Kan ik komen kijken?' },
} satisfies TemplateEntry
