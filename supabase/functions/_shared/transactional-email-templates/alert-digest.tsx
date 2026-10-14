import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Html, Img, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE = 'https://www.woonaanbod-nl.nl'
const THEME = { ink: '#14213D', accent: '#FF6B35', paper: '#F7F4EF', muted: '#526079', line: '#DCE0E6', white: '#FFFFFF' }
const FONT = "Sora, 'Segoe UI', Arial, sans-serif"
const LOGO = `${SITE}/__l5e/assets-v1/408e754a-9a8c-4f1c-8699-17885f3d7699/woonaanbod-logo-color.png`

interface Home { url: string; image?: string; title: string; address?: string; facts: string }
interface Props {
  city?: string
  count?: number
  heading?: string
  intro?: string
  overviewUrl?: string
  homes?: Home[]
  subject?: string
  unsubscribeUrl?: string
  manageUrl?: string
  partnerTipUrl?: string
  partnerTipText?: string
}

const paragraph = { fontSize: '14px', lineHeight: '1.7', color: THEME.muted, margin: '0 0 16px' }
const action = { backgroundColor: THEME.accent, color: THEME.ink, fontSize: '14px', fontWeight: 700, borderRadius: '6px', padding: '13px 22px', textDecoration: 'none' }

const AlertDigest = ({ city = 'Nederland', count = 0, heading, intro, overviewUrl = `${SITE}/nieuw-aanbod`, homes = [], unsubscribeUrl, manageUrl, partnerTipUrl, partnerTipText }: Props) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>{`${count} nieuwe ${count === 1 ? 'woning' : 'woningen'} voor jouw zoekopdracht. Bekijk de foto's, prijzen en details.`}</Preview>
    <Body style={{ backgroundColor: THEME.paper, fontFamily: FONT, color: THEME.ink, margin: 0, padding: '24px 0' }}>
      <Container style={{ width: '100%', maxWidth: '600px', margin: '0 auto', backgroundColor: THEME.white }}>
        <Section style={{ padding: '24px', borderBottom: `3px solid ${THEME.accent}` }}>
          <Link href={SITE}><Img src={LOGO} width="220" alt="Woonaanbod NL" style={{ display: 'block', maxWidth: '100%', height: 'auto' }} /></Link>
        </Section>
        {partnerTipUrl ? (
          <Section style={{ padding: '16px 24px 0' }}>
            <Section style={{ backgroundColor: THEME.paper, border: `1px solid ${THEME.line}`, borderRadius: '6px', padding: '14px 16px' }}>
              <Text style={{ color: THEME.muted, fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', margin: '0 0 4px' }}>Advertentie · Partner</Text>
              <Text style={{ ...paragraph, fontSize: '13px', margin: '0 0 10px' }}>{partnerTipText || 'Op zoek naar meer aanbod? Bekijk ook het particuliere aanbod via partner Huurzone.'}</Text>
              <Button href={partnerTipUrl} style={action}>Bekijk het particuliere aanbod bij Huurzone</Button>
            </Section>
          </Section>
        ) : null}
        <Section style={{ padding: '28px 24px 12px' }}>
          <Text style={{ color: THEME.muted, fontSize: '12px', fontWeight: 700, margin: '0 0 10px' }}>JOUW WOONMELDING · {city}</Text>
          <Text style={{ fontSize: '26px', lineHeight: '1.3', fontWeight: 700, color: THEME.ink, margin: '0 0 14px' }}>{count === 1 ? 'Een nieuwe plek om te bekijken.' : 'Nieuwe plekken. Nieuwe mogelijkheden.'}</Text>
          <Text style={paragraph}>{count === 1 ? 'Er is 1 nieuwe woning die aansluit op jouw zoekopdracht.' : `Er zijn ${count} nieuwe woningen die aansluiten op jouw zoekopdracht.`} Hieronder vind je de selectie, met de belangrijkste gegevens bij elkaar.</Text>
          {intro ? <Text style={{ ...paragraph, fontSize: '13px' }}>{intro}</Text> : null}
          <Text style={{ fontSize: '16px', fontWeight: 700, color: THEME.ink, margin: '8px 0 0' }}>{heading || `Nieuw woningaanbod in ${city}`}</Text>
        </Section>
        <Section style={{ padding: '0 24px' }}>
          {homes.map((home, i) => (
            <Section key={i} style={{ padding: '20px 0', borderBottom: `1px solid ${THEME.line}` }}>
              {home.image ? <Link href={home.url}><Img src={home.image} width="552" height="220" alt={[home.title, home.address].filter(Boolean).join(', ')} style={{ display: 'block', width: '100%', maxWidth: '552px', height: '220px', objectFit: 'cover', borderRadius: '6px' }} /></Link> : null}
              <Text style={{ color: THEME.ink, fontSize: '18px', lineHeight: '1.4', fontWeight: 700, margin: '14px 0 4px' }}><Link href={home.url} style={{ color: THEME.ink, textDecoration: 'none' }}>{home.title}</Link></Text>
              {home.address ? <Text style={{ ...paragraph, margin: '0 0 8px' }}>{home.address}</Text> : null}
              <Text style={{ color: THEME.ink, fontSize: '14px', fontWeight: 600, lineHeight: '1.6', margin: '0 0 12px' }}>{home.facts}</Text>
              <Button href={home.url} style={action}>Bekijk deze woning</Button>
            </Section>
          ))}
        </Section>
        <Section style={{ padding: '24px' }}>
          {count > homes.length ? <Text style={paragraph}>Deze mail toont {homes.length} woningen. Er zijn nog {count - homes.length} andere nieuwe resultaten voor jouw zoekopdracht.</Text> : null}
          <Button href={overviewUrl} style={{ ...action, backgroundColor: THEME.ink, color: THEME.white }}>Bekijk het woningaanbod in {city}</Button>
          <Text style={{ ...paragraph, fontSize: '12px', margin: '14px 0 0' }}>Interesse? Op de woningpagina vind je hoe je contact opneemt met de aanbieder. Het aanbod kan tussentijds veranderen.</Text>
        </Section>
        <Section style={{ backgroundColor: THEME.paper, padding: '20px 24px' }}>
          <Text style={{ color: THEME.ink, fontSize: '15px', fontWeight: 700, margin: '0 0 8px' }}>Past een andere plaats beter bij je?</Text>
          <Text style={{ ...paragraph, margin: '0 0 10px' }}>Je kunt ook een Woonmelding instellen voor een andere plaats of een ander woningtype. Gratis, zonder account.</Text>
          <Link href={`${SITE}/woonmelding`} style={{ color: THEME.ink, fontWeight: 700, fontSize: '13px', textDecoration: 'underline' }}>Nog een Woonmelding instellen</Link>
        </Section>
        <Section style={{ padding: '24px', borderBottom: `1px solid ${THEME.line}` }}>
          <Text style={{ ...paragraph, fontSize: '13px', margin: '0 0 10px' }}>Fijn dat je Woonaanbod NL gebruikt. Zou je ons willen helpen met een korte review op Google? Het kost maar een minuutje en helpt andere woningzoekenden ons te vinden.</Text>
          <Link href="https://g.page/r/CYZL1fpfWpFOEBM/review" style={{ color: THEME.ink, fontSize: '13px', fontWeight: 700, textDecoration: 'underline' }}>Laat een Google-review achter</Link>
        </Section>
        <Section style={{ padding: '20px 24px' }}>
          <Text style={{ ...paragraph, fontSize: '12px', margin: '0 0 12px' }}>Je ontvangt deze mail omdat je een Woonmelding hebt ingesteld bij Woonaanbod NL.</Text>
          {unsubscribeUrl || manageUrl ? <Text style={{ fontSize: '12px', lineHeight: '1.7', margin: '0 0 14px' }}>
            {manageUrl ? <Link href={manageUrl} style={{ color: THEME.ink, textDecoration: 'underline' }}>Beheer je alerts</Link> : null}
            {manageUrl && unsubscribeUrl ? ' · ' : ''}
            {unsubscribeUrl ? <Link href={unsubscribeUrl} style={{ color: THEME.ink, textDecoration: 'underline' }}>Afmelden voor deze meldingen</Link> : null}
          </Text> : null}
          <Text style={{ ...paragraph, fontSize: '11px', margin: 0 }}>
            <Link href={`${SITE}/privacy`} style={{ color: THEME.muted }}>Privacybeleid</Link> · <Link href="mailto:info@woonaanbod-nl.nl" style={{ color: THEME.muted }}>Contact</Link> · <Link href={`${SITE}/voorwaarden`} style={{ color: THEME.muted }}>Algemene voorwaarden</Link>
            <br />© {new Date().getFullYear()} Woonaanbod NL
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AlertDigest,
  subject: (data: Record<string, any>) => data.subject || `Woonmelding: nieuw woningaanbod in ${data.city || 'Nederland'}`,
  displayName: 'Woonmelding (nieuw aanbod)',
  previewData: {
    city: 'Rotterdam', count: 3, subject: 'Woonmelding Rotterdam: 3 nieuwe woningen voor jou',
    heading: 'Jouw selectie in Rotterdam', intro: 'Je zoekopdracht: woningaanbod in Rotterdam.',
    overviewUrl: `${SITE}/huurwoningen/rotterdam`,
    unsubscribeUrl: `${SITE}/alerts/afmelden/voorbeeld-token`, manageUrl: `${SITE}/radarmeldingen`,
    partnerTipUrl: `${SITE}/nieuw-aanbod`, partnerTipText: 'Op zoek naar meer aanbod? Bekijk ook het particuliere aanbod via partner Huurzone.',
    homes: [
      { url: `${SITE}/huurwoningen/rotterdam`, title: 'Appartement in Rotterdam', address: 'Coolsingel 10', facts: '45 m² • 2 kamers • € 1.050,00 p.m.' },
      { url: `${SITE}/huurwoningen/rotterdam`, title: 'Appartement in Rotterdam', address: 'Witte de Withstraat 3', facts: '52 m² • 2 kamers • € 920,00 p.m.' },
    ],
  },
} satisfies TemplateEntry
