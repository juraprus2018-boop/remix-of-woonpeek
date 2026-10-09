/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

const SITE = 'https://www.woonaanbod-nl.nl'
const LOGO = `${SITE}/icon-192.png`
const PRIMARY = '#173e63'
const ACCENT = '#3d7ab8'
const FONT = "Manrope, 'Segoe UI', Arial, sans-serif"

export const BrandLayout = ({
  preview,
  children,
}: {
  preview: string
  children: React.ReactNode
}) => (
  <Html lang="nl" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={{ backgroundColor: '#ffffff', fontFamily: FONT, margin: 0 }}>
      <Container style={{ maxWidth: '560px', margin: '0 auto', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        <Section style={{ backgroundColor: PRIMARY, padding: '22px 28px' }}>
          <table role="presentation" cellPadding={0} cellSpacing={0}>
            <tr>
              <td style={{ verticalAlign: 'middle' }}>
                <Img src={LOGO} width="40" height="40" alt="Woonaanbod NL" style={{ borderRadius: '8px', display: 'block' }} />
              </td>
              <td style={{ verticalAlign: 'middle', paddingLeft: '12px', color: '#ffffff', fontSize: '20px', fontFamily: "Sora, Arial, sans-serif", letterSpacing: '-0.5px' }}>
                woonaanbod<span style={{ fontWeight: 700, color: '#9cc3ea' }}>-nl.nl</span>
              </td>
            </tr>
          </table>
        </Section>
        <Section style={{ padding: '28px' }}>{children}</Section>
        <Section style={{ backgroundColor: '#f4f7fb', padding: '18px 28px', borderTop: '1px solid #e2e8f0' }}>
          <Text style={{ fontSize: '12px', color: '#64748b', margin: 0, textAlign: 'center' as const }}>
            Woonaanbod NL, al het huuraanbod van Nederland op één plek.
            <br />
            <Link href={SITE} style={{ color: ACCENT }}>woonaanbod-nl.nl</Link> · <Link href="mailto:info@woonaanbod-nl.nl" style={{ color: ACCENT }}>info@woonaanbod-nl.nl</Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const H1 = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontSize: '22px', fontWeight: 700, color: PRIMARY, margin: '0 0 16px', fontFamily: 'Sora, Arial, sans-serif' }}>{children}</Text>
)

export const P = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 20px' }}>{children}</Text>
)

export const Small = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5', margin: '24px 0 0' }}>{children}</Text>
)

export const CTA = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Button
    href={href}
    style={{ backgroundColor: PRIMARY, color: '#ffffff', fontSize: '15px', fontWeight: 700, borderRadius: '10px', padding: '14px 26px', textDecoration: 'none' }}
  >
    {children}
  </Button>
)

export const B = ({ children }: { children: React.ReactNode }) => (
  <strong style={{ color: PRIMARY }}>{children}</strong>
)
