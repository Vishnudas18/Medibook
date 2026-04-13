import { TriageUrgency } from '@/types';

const SPECIALIZATION_RULES: Record<string, string[]> = {
  Cardiology: ['chest pain', 'palpitations', 'shortness of breath', 'high bp', 'heart', 'hypertension'],
  Dermatology: ['rash', 'itching', 'acne', 'skin allergy', 'eczema', 'fungal', 'psoriasis'],
  Neurology: ['headache', 'migraine', 'dizziness', 'seizure', 'numbness', 'stroke', 'vertigo'],
  Orthopedics: ['back pain', 'knee pain', 'joint pain', 'fracture', 'sprain', 'arthritis', 'bone'],
  Pediatrics: ['child fever', 'child cough', 'newborn', 'infant'],
  Gynecology: ['period pain', 'pregnancy', 'pcos', 'pelvic pain', 'irregular periods'],
  Gastroenterology: ['stomach pain', 'acidity', 'vomiting', 'diarrhea', 'constipation', 'gastric'],
  Pulmonology: ['asthma', 'wheezing', 'breathlessness', 'lung', 'tuberculosis'],
  Endocrinology: ['thyroid', 'diabetes', 'sugar', 'hormone', 'insulin'],
  Psychiatry: ['anxiety', 'depression', 'panic', 'stress', 'insomnia'],
  ENT: ['ear pain', 'sinus', 'throat pain', 'tonsil', 'hearing loss'],
  Ophthalmology: ['eye pain', 'blurred vision', 'red eyes', 'vision'],
  Urology: ['urine', 'kidney stone', 'burning urination', 'prostate'],
  General: ['fever', 'cold', 'cough', 'fatigue', 'weakness', 'infection', 'pain'],
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function inferSpecialization(symptoms: string[], notes?: string): string {
  const normalizedSymptoms = symptoms.map((item) => normalizeText(item));
  const noteText = normalizeText(notes || '');
  const searchableText = [...normalizedSymptoms, noteText].join(' ');

  let bestSpecialization = 'General';
  let bestScore = 0;

  for (const [specialization, keywords] of Object.entries(SPECIALIZATION_RULES)) {
    const score = keywords.reduce((acc, keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      return searchableText.includes(normalizedKeyword) ? acc + 1 : acc;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestSpecialization = specialization;
    }
  }

  return bestSpecialization;
}

export function inferUrgency(
  durationDays: number,
  severity: number,
  symptoms: string[] = [],
  notes?: string
): TriageUrgency {
  const redFlagKeywords = ['severe chest pain', 'fainting', 'blood', 'unconscious', 'seizure'];
  const noteText = normalizeText(notes || '');
  const symptomText = symptoms.map((item) => normalizeText(item)).join(' ');
  const combinedText = `${symptomText} ${noteText}`.trim();
  const hasRedFlag = redFlagKeywords.some((keyword) => combinedText.includes(keyword));
  if (hasRedFlag) return 'high';

  const migraineLike = ['migraine', 'severe headache', 'headache with nausea', 'aura'];
  const cardioLike = ['chest pain', 'palpitations', 'breathlessness', 'shortness of breath'];
  const neuroLike = ['dizziness', 'numbness', 'confusion', 'vision loss', 'slurred speech'];

  const hasMigrainePattern = migraineLike.some((keyword) => combinedText.includes(keyword));
  const hasCardioPattern = cardioLike.some((keyword) => combinedText.includes(keyword));
  const hasNeuroPattern = neuroLike.some((keyword) => combinedText.includes(keyword));

  // Condition-aware escalation rules
  if (hasCardioPattern && (severity >= 6 || durationDays >= 2)) return 'high';
  if (hasNeuroPattern && (severity >= 6 || durationDays >= 2)) return 'high';
  if (hasMigrainePattern && (severity >= 6 || durationDays >= 7)) return 'high';
  if (hasMigrainePattern && (severity >= 4 || durationDays >= 3)) return 'medium';

  if (severity >= 8 || (severity >= 7 && durationDays >= 7)) return 'high';
  if (severity >= 5 || durationDays >= 5) return 'medium';
  return 'low';
}

export function buildTriageSummary(
  symptoms: string[],
  durationDays: number,
  severity: number,
  specialization: string,
  urgency: TriageUrgency,
  notes?: string
): string {
  const symptomText = symptoms.length > 0 ? symptoms.slice(0, 4).join(', ') : 'provided condition details';
  const noteHint = notes?.trim() ? ` Notes suggest: "${notes.trim().slice(0, 120)}".` : '';
  return `Based on reported symptoms (${symptomText}), duration (${durationDays} day(s)), and severity (${severity}/10), we recommend consulting ${specialization}. Current urgency is ${urgency.toUpperCase()}.${noteHint} This is guidance support and not a medical diagnosis.`;
}
