/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { BrandLayout, H1, P, CTA, Small, B } from './layout.tsx'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ recipient, confirmationUrl }: SignupEmailProps) => (
  <BrandLayout preview="Bevestig je e-mailadres en zoek direct verder">
    <H1>Welkom bij Woonaanbod NL!</H1>
    <P>
      Fijn dat je er bent. Bevestig je e-mailadres (<B>{recipient}</B>) en je kunt meteen woningen opslaan,
      gratis meldingen ontvangen en reageren op nieuw aanbod.
    </P>
    <CTA href={confirmationUrl}>E-mailadres bevestigen</CTA>
    <Small>Heb je geen account aangemaakt? Dan kun je deze e-mail gewoon negeren.</Small>
  </BrandLayout>
)

export default SignupEmail
