import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

export default function PropertyReport({ propertyId }: { propertyId: string }) {
  const [reason, setReason] = useState('verlopen');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  return <details className="rounded-xl border border-border bg-card p-4">
    <summary className="cursor-pointer text-sm font-medium">Meld verlopen advertentie of onjuiste info</summary>
    <form className="mt-4 space-y-3" onSubmit={async e => {
      e.preventDefault(); setPending(true);
      try {
        // Separate insert-only reporting table, never modify or remove the listing.
        const { error } = await supabase.from('property_reports' as never).insert({ property_id: propertyId, reason, message: message.trim() || null } as never);
        if (error) throw error;
        setMessage(''); toast({ title: 'Bedankt, je melding is ontvangen' });
      } catch { toast({ title: 'Melden is momenteel niet beschikbaar', description: 'Probeer het later opnieuw.', variant: 'destructive' }); }
      finally { setPending(false); }
    }}>
      <Label htmlFor="report-reason">Reden</Label>
      <select id="report-reason" value={reason} onChange={e => setReason(e.target.value)} className="block w-full rounded-md border border-input bg-background p-2 text-sm"><option value="verlopen">Advertentie verlopen</option><option value="onjuiste_info">Onjuiste informatie</option></select>
      <Label htmlFor="report-message">Toelichting (optioneel)</Label>
      <Textarea id="report-message" maxLength={2000} value={message} onChange={e => setMessage(e.target.value)} />
      <p className="text-xs text-muted-foreground">Deel geen contactgegevens. Een melding is geen aanvraag bij de verhuurder.</p>
      <Button type="submit" disabled={pending}>{pending ? 'Verzenden...' : 'Melding versturen'}</Button>
    </form>
  </details>;
}
