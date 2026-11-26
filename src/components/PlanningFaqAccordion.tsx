import { Plus } from 'lucide-react';
import { PLANNING_FAQS } from '../data/studioContent';

export function PlanningFaqAccordion() {
  return (
    <div className="ceremony-faq">
      {PLANNING_FAQS.map(({ question, answer }, index) => (
        <details key={question} className="ceremony-faq__item" open={index === 0}>
          <summary className="ceremony-faq__trigger">
            <h3>{question}</h3>
            <Plus className="ceremony-faq__icon" size={18} aria-hidden="true" />
          </summary>
          <p className="ceremony-faq__answer">{answer}</p>
        </details>
      ))}
    </div>
  );
}
