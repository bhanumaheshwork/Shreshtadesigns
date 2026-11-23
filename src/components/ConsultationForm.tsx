import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { CeremonyId } from '../data/ceremonies';
import './ConsultationForm.css';

const GUEST_RANGES = [
  'Under 100',
  '100–499',
  '500–999',
  '1,000–1,999',
  '2,000–2,999',
  '3,000–4,000',
  'Over 4,000',
];

const SEND_ERROR = 'We couldn’t send your enquiry. Please try again or contact us on WhatsApp.';

function validatePhone(input: HTMLInputElement) {
  const phone = input.value.trim();
  const digits = phone.replace(/\D/g, '').length;
  const valid = /^\+?[0-9 ().-]+$/.test(phone) && digits >= 7 && digits <= 15;
  input.setCustomValidity(input.value === '' || valid ? '' : 'Enter a contact number with 7–15 digits.');
}

export function ConsultationForm({
  className,
  ceremonies,
}: {
  className?: string;
  ceremonies?: CeremonyId[];
}) {
  const [guestRange, setGuestRange] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const inFlight = useRef(false);
  const successTimerRef = useRef<number | null>(null);
  const customGuests = guestRange === 'custom';

  useEffect(() => {
    return () => {
      if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
    };
  }, []);

  async function submitConsultation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    const form = event.currentTarget;
    const formData = Object.fromEntries(new FormData(form));
    const payload = {
      ...formData,
      ...(ceremonies?.length ? { ceremonies } : {}),
      ...(customGuests ? { guest_count: Number(formData.guest_count) } : {}),
    };
    inFlight.current = true;
    setSending(true);
    setFeedback(null);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || result?.ok !== true) {
        setFeedback({ kind: 'error', text: typeof result?.error === 'string' ? result.error : SEND_ERROR });
        return;
      }

      form.reset();
      setGuestRange('');
      setFeedback({ kind: 'success', text: 'Your enquiry has been sent successfully. We’ll be in touch.' });
      if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
      successTimerRef.current = window.setTimeout(() => {
        setFeedback(null);
      }, 5000);
    } catch {
      setFeedback({ kind: 'error', text: SEND_ERROR });
    } finally {
      window.clearTimeout(timeout);
      inFlight.current = false;
      setSending(false);
    }
  }

  return (
    <>
      <p className="consultation-form__fallback">To enquire, email <a href="mailto:info@shreshtadesigns.com">info@shreshtadesigns.com</a> or use the WhatsApp button.</p>
      <form
        className={className ? `consultation-form ${className} ${feedback?.kind === 'success' ? 'is-success' : ''}` : `consultation-form ${feedback?.kind === 'success' ? 'is-success' : ''}`}
        action="/api/consultation"
        method="post"
        onChange={() => setFeedback(null)}
        onSubmit={submitConsultation}
        aria-busy={sending}
      >
        <fieldset className="consultation-form__fields" disabled={sending}>
          <div hidden>
            <input name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <label>
            <span>Your name <span aria-hidden="true">*</span></span>
            <input name="name" autoComplete="name" placeholder="Full name" pattern={'.*\\S.*'} maxLength={150} required />
          </label>
          <label>
            <span>Partner’s name <span aria-hidden="true">*</span></span>
            <input name="partner_name" placeholder="Full name" pattern={'.*\\S.*'} maxLength={150} required />
          </label>
          <label>
            <span>Email address <span aria-hidden="true">*</span></span>
            <input name="email" type="email" autoComplete="email" placeholder="your@email.com" maxLength={254} required />
          </label>
          <label>
            <span>Contact number <span aria-hidden="true">*</span></span>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 00000 00000"
              maxLength={40}
              onChange={(event) => validatePhone(event.currentTarget)}
              required
            />
          </label>
          <label>
            <span>Wedding date <span aria-hidden="true">*</span></span>
            <input name="wedding_date" type="date" required />
          </label>
          <div className="consultation-form__guest-picker">
            <label>
              <span>Expected guests <span aria-hidden="true">*</span></span>
              <select
                name="guest_range"
                value={guestRange}
                onChange={(event) => setGuestRange(event.currentTarget.value)}
                required
              >
                <option value="" disabled>Select range</option>
                {GUEST_RANGES.map((range) => <option key={range}>{range}</option>)}
                <option value="custom">Custom guest count</option>
              </select>
            </label>
            {customGuests ? (
              <label>
                <span>Custom guest count <span aria-hidden="true">*</span></span>
                <input name="guest_count" type="number" min={1} step={1} placeholder="e.g. 650" required />
              </label>
            ) : (
              <input
                type="range"
                min={0}
                max={GUEST_RANGES.length}
                step={1}
                value={GUEST_RANGES.indexOf(guestRange) + 1}
                aria-label="Adjust expected guest range"
                aria-valuetext={guestRange || 'No range selected'}
                onChange={(event) => setGuestRange(GUEST_RANGES[event.currentTarget.valueAsNumber - 1] ?? '')}
              />
            )}
          </div>
          <label className="consultation-form__wide">
            <span>Dream venue or destination <small>Optional</small></span>
            <input name="venue" placeholder="Palace, city or destination in mind" maxLength={200} />
          </label>
          <label className="consultation-form__wide">
            <span>Your vision <small>Optional</small></span>
            <textarea name="vision" rows={3} placeholder="Tell us what you imagine for your celebration" maxLength={3000} />
          </label>
          <label className="consultation-form__wide">
            <span>Celebration scope <small>Optional</small></span>
            <select name="scope" defaultValue="">
              <option value="">Select celebration scope</option>
              <option>Full Weekend Celebration</option>
              <option>Engagement &amp; Sangeet</option>
              <option>Haldi &amp; Wedding Mandap</option>
              <option>Reception Gala</option>
              <option>Private Consultation</option>
            </select>
          </label>
          <p className="consultation-form__privacy">We use these details to respond to your enquiry and discuss your celebration.</p>
          <button type="submit">{sending ? 'Sending…' : 'Request a consultation'}</button>
        </fieldset>
        {feedback && (
          <div className={`consultation-form__feedback ${feedback.kind === 'success' ? 'is-success' : ''}`} role={feedback.kind === 'error' ? 'alert' : 'status'}>
            {feedback.kind === 'success' && <span className="consultation-form__tick" aria-hidden="true">✓</span>}
            <span>{feedback.text}</span>
          </div>
        )}
      </form>
    </>
  );
}
