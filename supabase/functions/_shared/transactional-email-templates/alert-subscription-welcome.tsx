import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const brand = { ink: '#14213D', orange: '#FF6B35', chalk: '#F7F4EF', slate: '#8D99AE', white: '#ffffff' }
const site = 'https://www.woonaanbod-nl.nl'
const logo = `${site}/__l5e/assets-v1/408e754a-9a8c-4f1c-8699-17885f3d7699/woonaanbod-logo-color.png`

const AlertSubscriptionWelcome = ({ searchLabel = 'woningen in heel Nederland' }: { searchLabel?: string }) => (
  <Html lang="nl">
    <Head />
    <Preview>Je woningalert staat aan. We gaan voor je aan de slag!</Preview>
    <Body style={{ backgroundColor: brand.white, fontFamily: 'Sora, Arial, sans-serif', color: brand.ink, margin: 0 }}>
      <Container style={{ maxWidth: '600px', padding: '24px' }}>
        <Img src={logo} alt="Woonaanbod NL" width="240" style={{ maxWidth: '100%', height: 'auto', marginBottom: '24px' }} />
        <Section style={{ backgroundColor: brand.chalk, borderTop: `4px solid ${brand.orange}`, padding: '24px', borderRadius: '8px' }}>
          <Heading style={{ fontSize: '24px', lineHeight: '1.3', margin: '0 0 16px' }}>Bedankt voor je inschrijving!</Heading>
          <Text style={{ lineHeight: '1.7' }}>Je gratis woningalert staat aan. We gaan voor je aan de slag en houden nieuw aanbod voor jouw zoekopdracht in de gaten.</Text>
          <Text style={{ fontWeight: 700 }}>Jouw zoekopdracht: {searchLabel}</Text>
          <Text style={{ lineHeight: '1.7' }}>Als er nieuw passend aanbod is, ontvang je een woningmail. Een account aanmaken is niet nodig.</Text>
          <Button href={`${site}/woning-zoeken`} style={{ backgroundColor: brand.orange, color: brand.ink, fontWeight: 700, padding: '14px 20px', borderRadius: '8px' }}>Bekijk het actuele aanbod</Button>
        </Section>
        <Text style={{ fontSize: '14px', lineHeight: '1.7' }}>Voeg ons toe aan je veilige afzenders. Zo voorkom je dat woningmails in je spambox of bij ongewenste e-mail terechtkomen.</Text>
        <Text style={{ fontSize: '12px', color: brand.ink }}>Woonaanbod NL · Vragen? info@woonaanbod-nl.nl</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AlertSubscriptionWelcome,
  subject: 'Bedankt voor je inschrijving! Je woningalert staat aan',
  displayName: 'Woonmelding inschrijfbevestiging',
  previewData: { searchLabel: 'Appartement in Rotterdam' },
} satisfies TemplateEntry