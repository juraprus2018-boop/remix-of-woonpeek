import { useEffect, useState } from "react";
import { BellRing, MailCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Confirmation {
  email: string;
  label?: string;
  alreadyActive?: boolean;
  emailSent?: boolean;
}

export function confirmAlertSubscription(data: { already_active?: boolean; confirmation_email_sent?: boolean }, email: string, label?: string) {
  window.dispatchEvent(new CustomEvent<Confirmation>("woonaanbod:alert-confirmed", {
    detail: { email, label, alreadyActive: data.already_active, emailSent: data.confirmation_email_sent },
  }));
}

export default function AlertSubscriptionConfirmation() {
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  useEffect(() => {
    const handler = (event: Event) => setConfirmation((event as CustomEvent<Confirmation>).detail);
    window.addEventListener("woonaanbod:alert-confirmed", handler);
    return () => window.removeEventListener("woonaanbod:alert-confirmed", handler);
  }, []);

  return (
    <Dialog open={Boolean(confirmation)} onOpenChange={(open) => { if (!open) setConfirmation(null); }}>
      <DialogContent className="z-[110] w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto rounded-lg bg-card p-6 sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <BellRing className="h-8 w-8" />
        </div>
        <DialogTitle className="text-center text-2xl leading-tight">
          {confirmation?.alreadyActive ? "Je woningalert staat al aan!" : "Je woningalert staat aan!"}
        </DialogTitle>
        <DialogDescription className="text-center">
          Bedankt voor je inschrijving. We gaan voor je aan de slag{confirmation?.label ? ` voor ${confirmation.label}` : ""}.
          Je ontvangt nieuw passend aanbod per e-mail. Een account aanmaken is niet nodig.
        </DialogDescription>
        <div className="rounded-lg border border-accent/30 bg-accent/10 p-4">
          <div className="mb-2 flex items-center gap-2 font-semibold"><MailCheck className="h-5 w-5 shrink-0" />Check je mail én spambox</div>
          <p className="break-words text-sm text-muted-foreground">
            {confirmation?.emailSent
              ? `We hebben een bevestiging gestuurd naar ${confirmation.email}.`
              : confirmation?.alreadyActive
                ? `Je meldingen worden gestuurd naar ${confirmation.email}. Je ontvangt niet opnieuw een welkomstmail.`
                : "Je inschrijving is opgeslagen, maar de bevestigingsmail kon niet worden verstuurd. Je hoeft je niet opnieuw in te schrijven."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Kijk ook bij ongewenste e-mail en voeg ons toe aan je veilige afzenders.</p>
        </div>
        <Button size="lg" className="w-full" onClick={() => setConfirmation(null)}>Helemaal goed!</Button>
      </DialogContent>
    </Dialog>
  );
}