import * as React from 'npm:react@18.3.1'
import { Img, Link, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { Layout, P, CTA, PRIMARY, ACCENT, GOLD, SITE } from './layout.tsx'

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
}

const tips = [
  'Verhuurders krijgen soms tientallen reacties op één woning. Maak daarom meteen duidelijk wie je bent en waarom je interesse hebt.',
  'Stel jezelf kort voor: je leeftijd, je huidige woonsituatie en met wie je wilt gaan wonen.',
  'Vertel hoe je werk eruitziet (loondienst, zzp, thuiswerken) en noem praktische zaken zoals een huisdier of een verhuurdersreferentie.',
  'Leg uit waarom juist deze woning je aanspreekt: de buurt, de indeling of de ligging.',
  'Houd het kort. Een paar zinnen over wie je bent, je situatie en waarom deze woning past, is genoeg.',
]

const AlertDigest = ({ city = 'Nederland', count = 0, heading, intro, overviewUrl = `${SITE}/nieuw-aanbod`, homes = [], unsubscribeUrl, manageUrl }: Props) => (
  <Layout preview={`${count} nieuwe huurwoningen in ${city}`}>
    <table role="presentation" cellPadding={0} cellSpacing={0}><tbody><tr>
      <td style={{ verticalAlign: 'top', paddingRight: '14px' }}>
        <div style={{ minWidth: '46px', height: '46px', lineHeight: '46px', borderRadius: '10px', backgroundColor: GOLD, color: PRIMARY, textAlign: 'center', fontSize: '22px', fontWeight: 800 }}>{count}</div>
      </td>
      <td style={{ fontSize: '16px', lineHeight: '1.5', color: '#0f172a', fontWeight: 600 }}>
        Heb je het al gezien? In {city} {count === 1 ? 'staat 1 nieuwe huurwoning' : `staan ${count} nieuwe huurwoningen`} voor je klaar. Zit jouw nieuwe thuis ertussen?
      </td>
    </tr></tbody></table>
    <P>{' '}</P>
    {intro ? <P>{intro} Reageer snel: de beste woningen zijn vaak binnen een dag weg.</P> : null}
    <Text style={{ fontSize: '17px', fontWeight: 700, color: PRIMARY, margin: '8px 0 4px' }}>{heading || `Nieuwe woningen te huur in en rondom ${city}`}</Text>
    <table width="100%" role="presentation" cellPadding={0} cellSpacing={0}><tbody>
      {homes.map((h, i) => (
        <tr key={i}><td style={{ padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
          <table width="100%" role="presentation" cellPadding={0} cellSpacing={0}><tbody><tr>
            <td width="132" style={{ verticalAlign: 'top' }}>
              <Link href={h.url}>
                {h.image
                  ? <Img src={h.image} width="120" height="90" alt={h.title} style={{ display: 'block', width: '120px', height: '90px', objectFit: 'cover', borderRadius: '8px' }} />
                  : <div style={{ width: '120px', height: '90px', backgroundColor: '#e8eef5', borderRadius: '8px' }} />}
              </Link>
            </td>
            <td style={{ verticalAlign: 'top' }}>
              <Link href={h.url} style={{ color: PRIMARY, fontWeight: 700, fontSize: '15px', textDecoration: 'none' }}>{h.title}</Link>
              {h.address ? <div style={{ fontSize: '13px', color: '#475569', margin: '3px 0' }}>{h.address}</div> : null}
              <div style={{ fontSize: '13px', color: '#15803d', margin: '3px 0' }}>✅ Beschikbaar</div>
              <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: 600 }}>{h.facts}</div>
              <Link href={h.url} style={{ display: 'inline-block', marginTop: '6px', color: ACCENT, fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>reageren »</Link>
            </td>
          </tr></tbody></table>
        </td></tr>
      ))}
    </tbody></table>
    {count > homes.length ? <P>...en nog {count - homes.length} andere woningen.</P> : null}
    <div style={{ textAlign: 'center', margin: '22px 0 6px' }}>
      <CTA href={overviewUrl}>Bekijk al het aanbod in {city} »</CTA>
    </div>
    <Text style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' as const, margin: '8px 0 18px' }}>Let op: vragen over woningen kunnen we helaas niet per e-mail beantwoorden.</Text>

    <div style={{ backgroundColor: '#f4f7fb', borderRadius: '12px', padding: '18px 20px', marginBottom: '18px' }}>
      <div style={{ fontSize: '16px', fontWeight: 700, color: PRIMARY, marginBottom: '6px' }}>🧩 Zoek je iets specifiekers?</div>
      <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#334155', marginBottom: '10px' }}>Stel een extra Woonmelding in met jouw plaats, woningtype en maximale huur. Komt er iets binnen dat past, dan hoor je het meteen.</div>
      <Link href={`${SITE}/woonmelding`} style={{ color: ACCENT, fontWeight: 700, fontSize: '13px' }}>zoekprofiel instellen »</Link>
    </div>

    <div style={{ fontSize: '16px', fontWeight: 700, color: PRIMARY, marginBottom: '6px' }}>Maak van je eerste bericht meer dan een reactie</div>
    <table width="100%" role="presentation" cellPadding={0} cellSpacing={0}><tbody>
      {tips.map((t, i) => (
        <tr key={i}>
          <td width="34" style={{ verticalAlign: 'top', padding: '6px 0' }}>
            <div style={{ width: '24px', height: '24px', lineHeight: '24px', borderRadius: '12px', backgroundColor: PRIMARY, color: '#ffffff', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>{i + 1}</div>
          </td>
          <td style={{ verticalAlign: 'top', padding: '6px 0', fontSize: '13px', lineHeight: '1.55', color: '#334155' }}>{t}</td>
        </tr>
      ))}
    </tbody></table>

    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px', textAlign: 'center', marginTop: '18px' }}>
      <div style={{ color: '#334155', fontSize: '13px', lineHeight: '1.6', marginBottom: '10px' }}>Fijn dat je Woonaanbod NL gebruikt. Zou je ons willen helpen met een korte review op Google? Het kost maar een minuutje en helpt andere woningzoekenden ons te vinden.</div>
      <CTA href="https://g.page/r/CYZL1fpfWpFOEBM/review" gold>⭐ Laat een Google-review achter</CTA>
    </div>

    {unsubscribeUrl || manageUrl ? (
      <Text style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' as const, margin: '20px 0 0', lineHeight: '1.6' }}>
        Je ontvangt deze e-mail omdat je een Woonmelding hebt ingesteld op Woonaanbod NL.
        <br />
        {manageUrl ? <Link href={manageUrl} style={{ color: ACCENT }}>Beheer je alerts</Link> : null}
        {manageUrl && unsubscribeUrl ? ' · ' : ''}
        {unsubscribeUrl ? <Link href={unsubscribeUrl} style={{ color: ACCENT }}>Afmelden voor deze meldingen</Link> : null}
      </Text>
    ) : null}
  </Layout>
)

export const template = {
  component: AlertDigest,
  subject: (d: Record<string, any>) => d.subject || `Nieuwe huurwoningen in ${d.city || 'Nederland'}`,
  displayName: 'Woonmelding (nieuw aanbod)',
  previewData: {
    city: 'Rotterdam', count: 3, subject: 'Voor de middag: verse huurvondsten in Rotterdam van 9 oktober',
    intro: 'Nieuw aanbod voor jouw zoekopdracht: woningaanbod in Rotterdam.',
    overviewUrl: 'https://www.woonaanbod-nl.nl/huurwoningen/rotterdam',
    unsubscribeUrl: 'https://www.woonaanbod-nl.nl/alerts/afmelden/voorbeeld-token',
    manageUrl: 'https://www.woonaanbod-nl.nl/radarmeldingen',
    homes: [
      { url: 'https://www.woonaanbod-nl.nl', title: 'Appartement in Rotterdam', address: 'Coolsingel 10', facts: '45 m² • 2 kamers • € 1.050,00 p.m.' },
      { url: 'https://www.woonaanbod-nl.nl', title: 'Appartement in Rotterdam', address: 'Witte de Withstraat 3', facts: '52 m² • 2 kamers • € 920,00 p.m.' },
    ],
  },
} satisfies TemplateEntry
