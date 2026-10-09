/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { BrandLayout, H1, P, CTA, Small, B } from './layout.tsx'

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address; `email` may equal the new
  // recipient in the secure fanout, so render oldEmail as the "from" value.
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ oldEmail, email, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <BrandLayout preview="Bevestig je nieuwe e-mailadres">
    <H1>Bevestig je nieuwe e-mailadres</H1>
    <P>
      Je hebt gevraagd om je e-mailadres te wijzigen van <B>{oldEmail || email}</B> naar <B>{newEmail}</B>.
      Klik op de knop om dit te bevestigen.
    </P>
    <CTA href={confirmationUrl}>Wijziging bevestigen</CTA>
    <Small>Heb je dit niet aangevraagd? Beveilig dan direct je account door je wachtwoord te wijzigen.</Small>
  </BrandLayout>
)

export default EmailChangeEmail
