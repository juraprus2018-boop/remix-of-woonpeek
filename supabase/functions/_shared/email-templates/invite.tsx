/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { BrandLayout, H1, P, CTA, Small } from './layout.tsx'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ confirmationUrl }: InviteEmailProps) => (
  <BrandLayout preview="Je bent uitgenodigd voor Woonaanbod NL">
    <H1>Je bent uitgenodigd</H1>
    <P>
      Je bent uitgenodigd om een account aan te maken op Woonaanbod NL. Klik op de knop om je uitnodiging
      te accepteren en je account in te stellen.
    </P>
    <CTA href={confirmationUrl}>Uitnodiging accepteren</CTA>
    <Small>Verwachtte je deze uitnodiging niet? Dan kun je deze e-mail negeren.</Small>
  </BrandLayout>
)

export default InviteEmail
