export interface MailTemplate {
  id: string;
  name: string;
  subject: string;
}

export interface ReferenceData {
  countries: string[];
  currencies: string[];
  mailTemplates: MailTemplate[];
}

export interface ReferencesState {
  data: ReferenceData | null;
  loading: boolean;
  error: string | null;
}

export const initialReferencesState: ReferencesState = {
  data: null,
  loading: false,
  error: null,
};