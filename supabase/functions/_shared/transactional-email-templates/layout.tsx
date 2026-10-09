import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Html, Img, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'

export const SITE = 'https://www.woonaanbod-nl.nl'
export const PRIMARY = '#173e63'
export const ACCENT = '#3d7ab8'
export const GOLD = '#e8a317'
const FONT = "Manrope, 'Segoe UI', Arial, sans-serif"

export const Layout = ({ preview, children }: { preview: string; children: React.ReactNode }) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={{ backgroundColor: '#ffffff', fontFamily: FONT, margin: 0 }}>
      <Container style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <Section style={{ backgroundColor: PRIMARY, padding: '20px 26px' }}>
          <table role="presentation" cellPadding={0} cellSpacing={0}><tbody><tr>
            <td><Img src={`${SITE}/icon-192.png`} width="38" height="38" alt="Woonaanbod NL" style={{ borderRadius: '8px', display: 'block' }} /></td>
            <td style={{ paddingLeft: '12px', color: '#ffffff', fontSize: '20px', fontFamily: 'Sora, Arial, sans-serif' }}>
              woonaanbod<span style={{ fontWeight: 700, color: '#9cc3ea' }}>-nl.nl</span>
            </td>
          </tr></tbody></table>
        </Section>
        <Section style={{ padding: '26px' }}>{children}</Section>
        <Section style={{ backgroundColor: '#f4f7fb', padding: '16px 26px', borderTop: '1px solid #e2e8f0' }}>
          <Text style={{ fontSize: '12px', color: '#64748b', margin: 0, textAlign: 'center' as const, lineHeight: '1.6' }}>
            <Link href={`${SITE}/privacy`} style={{ color: '#64748b' }}>Privacybeleid</Link> ∙{' '}
            <Link href="mailto:info@woonaanbod-nl.nl" style={{ color: '#64748b' }}>Contact</Link> ∙{' '}
            <Link href={`${SITE}/voorwaarden`} style={{ color: '#64748b' }}>Algemene voorwaarden</Link>
            <br />© {new Date().getFullYear()} Woonaanbod NL
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const H1 = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontSize: '21px', fontWeight: 700, color: PRIMARY, margin: '0 0 14px', fontFamily: 'Sora, Arial, sans-serif' }}>{children}</Text>
)
export const H2 = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontSize: '16px', fontWeight: 700, color: PRIMARY, margin: '20px 0 6px' }}>{children}</Text>
)
export const P = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 14px' }}>{children}</Text>
)
export const CTA = ({ href, children, gold }: { href: string; children: React.ReactNode; gold?: boolean }) => (
  <Button href={href} style={{ backgroundColor: gold ? GOLD : PRIMARY, color: gold ? PRIMARY : '#ffffff', fontSize: '14px', fontWeight: 700, borderRadius: '10px', padding: '12px 24px', textDecoration: 'none' }}>
    {children}
  </Button>
)
