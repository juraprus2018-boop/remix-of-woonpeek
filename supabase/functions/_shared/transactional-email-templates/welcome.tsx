import * as React from 'npm:react@18.3.1'
import type { TemplateEntry } from './registry.ts'
import { Layout, H1, H2, P, CTA, SITE } from './layout.tsx'

const Welcome = ({ name }: { name?: string }) => (
  <Layout preview="Welkom! Zo vind je sneller een huurwoning">
    <H1>Welkom bij Woonaanbod NL{name ? `, ${name}` : ''}!</H1>
    <P>Fijn dat je er bent. Met deze 3 tips vind je sneller een huurwoning.</P>
    <H2>1. Zet een gratis Woonmelding aan</H2>
    <P>Krijg een mail zodra er een nieuwe woning in jouw stad verschijnt. Wie snel reageert, maakt meer kans.</P>
    <CTA href={`${SITE}/woonmelding`}>Woonmelding instellen</CTA>
    <H2>2. Sla woningen op als favoriet</H2>
    <P>Dan zie je meteen als de prijs of status van die woning verandert.</P>
    <H2>3. Houd je papieren klaar</H2>
    <P>Verhuurders vragen vaak om een kopie ID, je laatste 3 loonstroken, een werkgeversverklaring en soms een verhuurdersverklaring. Heb je ze klaar, dan ben je vaak eerder dan de rest.</P>
    <CTA href={`${SITE}/account`} gold>Naar mijn dashboard</CTA>
    <P>{' '}</P>
    <P>Succes met zoeken!<br />Team Woonaanbod NL</P>
  </Layout>
)

export const template = {
  component: Welcome,
  subject: 'Welkom bij Woonaanbod NL: zo vind je sneller een huurwoning',
  displayName: 'Welkomstmail',
  previewData: { name: 'Sanne' },
} satisfies TemplateEntry
