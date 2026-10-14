import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { template } from './alert-digest.tsx'

const html = await renderAsync(React.createElement(template.component, template.previewData))
console.log('tip label:', html.includes('Advertentie · Partner'))
console.log('tip button:', html.includes('Bekijk het particuliere aanbod bij Huurzone'))
console.log('unsubscribe:', html.includes('Afmelden voor deze meldingen'))
console.log('manage:', html.includes('Beheer je alerts'))
console.log('homes rendered:', (html.match(/Bekijk deze woning/g) || []).length)
