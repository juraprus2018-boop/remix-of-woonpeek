import * as React from 'npm:react@18.3.1'
import type { TemplateEntry } from './registry.ts'
import { Layout, H1, H2, P, CTA, SITE } from './layout.tsx'

interface Props { agencyName?: string; slug?: string; feedLinked?: boolean }

const AgencyWelcome = ({ agencyName, slug, feedLinked }: Props) => (
  <Layout preview="Je makelaarsprofiel staat klaar">
    <H1>Welkom{agencyName ? `, ${agencyName}` : ''}!</H1>
    <P>Je bedrijfsprofiel op Woonaanbod NL is aangemaakt. Plaatsen is en blijft gratis.</P>
    <H2>Wat nu?</H2>
    <P>{feedLinked
      ? 'We halen je aanbod automatisch op uit je feed. Nieuwe woningen verschijnen elke dag vanzelf op de site.'
      : 'Voeg je eerste woning toe via het dashboard, of koppel later alsnog een XML- of JSON-feed.'}</P>
    <CTA href={`${SITE}/makelaar-portal`}>Naar mijn dashboard</CTA>
    {slug ? <P>{' '}<br />Je openbare pagina: <a href={`${SITE}/makelaars/${slug}`} style={{ color: '#3d7ab8' }}>{`woonaanbod-nl.nl/makelaars/${slug}`}</a></P> : null}
    <P>Vragen? Mail ons gerust op info@woonaanbod-nl.nl.<br />Team Woonaanbod NL</P>
  </Layout>
)

export const template = {
  component: AgencyWelcome,
  subject: 'Je makelaarsprofiel op Woonaanbod NL staat klaar',
  displayName: 'Makelaar-aanmelding',
  previewData: { agencyName: 'Makelaardij De Haven', slug: 'makelaardij-de-haven-rotterdam', feedLinked: true },
} satisfies TemplateEntry
