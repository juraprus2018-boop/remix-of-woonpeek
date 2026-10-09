/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { BrandLayout, H1, P, CTA, Small } from './layout.tsx'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <BrandLayout preview="Je inloglink voor Woonaanbod NL">
    <H1>Inloggen zonder wachtwoord</H1>
    <P>Klik op de knop hieronder om in te loggen. Deze link is maar kort geldig.</P>
    <CTA href={confirmationUrl}>Inloggen</CTA>
    <Small>Heb je niet geprobeerd in te loggen? Dan kun je deze e-mail negeren.</Small>
  </BrandLayout>
)

export default MagicLinkEmail
