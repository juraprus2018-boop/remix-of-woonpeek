/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Text } from 'npm:@react-email/components@0.0.22'
import { BrandLayout, H1, P, Small } from './layout.tsx'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <BrandLayout preview="Je verificatiecode voor Woonaanbod NL">
    <H1>Je verificatiecode</H1>
    <P>Gebruik deze code om te bevestigen dat jij het bent:</P>
    <Text style={{ fontFamily: "Courier, monospace", fontSize: '28px', fontWeight: 700, letterSpacing: '4px', color: '#173e63', backgroundColor: '#f4f7fb', borderRadius: '10px', padding: '14px 20px', display: 'inline-block', margin: 0 }}>
      {token}
    </Text>
    <Small>Deze code is kort geldig. Heb je dit niet aangevraagd? Dan kun je deze e-mail negeren.</Small>
  </BrandLayout>
)

export default ReauthenticationEmail
