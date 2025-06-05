export interface QuestionOption {
  label: string;
}

export type QuestionType = 'text' | 'radio' | 'checkbox' | 'select';

export interface Question {
  _id?: string;
  title: string;
  type: QuestionType;
  options?: QuestionOption[];
}

export interface Survey {
  _id?: string;
  name: string;
  questions: Question[];
}
