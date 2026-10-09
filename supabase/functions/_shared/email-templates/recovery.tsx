/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { BrandLayout, H1, P, CTA, Small } from './layout.tsx'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <BrandLayout preview="Stel een nieuw wachtwoord in voor Woonaanbod NL">
    <H1>Nieuw wachtwoord instellen</H1>
    <P>We kregen een verzoek om je wachtwoord te wijzigen. Klik op de knop om een nieuw wachtwoord te kiezen.</P>
    <CTA href={confirmationUrl}>Nieuw wachtwoord kiezen</CTA>
    <Small>Heb je dit niet aangevraagd? Dan kun je deze e-mail negeren, je wachtwoord blijft hetzelfde.</Small>
  </BrandLayout>
)

export default RecoveryEmail
