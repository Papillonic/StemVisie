// src/types.ts
export interface Amendment {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  simplified?: string;
  Soort?: string;
  Categorie?: string[];
  stemDatum?: string;
  indieners?: {
    naam: string;
    fractie: string;
  }[];
}

export type Vote = 'voor' | 'tegen' | 'onthouden';

export interface VoteSubmission {
  amendmentId: string;
  vote: Vote;
}

export interface Party {
  id: number;
  name: string;
  abbreviation: string;
  color: string;
  votes: Record<string, { voor: number; tegen: number; onthouden: number }>;
}
