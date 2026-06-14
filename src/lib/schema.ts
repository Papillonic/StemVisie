export interface Party {
  id: string;
  name: string;
  abbreviation: string;
  color?: string;
  votes?: Record<string, any>;
}

export interface SeatAssignment {
  index: number;
  partyAbbreviation: string;
}

export interface ChamberLayoutPeriod {
  startDate: string;
  seats: SeatAssignment[];
}

export interface Amendment {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  simplified?: string;
  Soort?: string;
  Categorie?: string;
  stemDatum: string;
  indieners?: {
    naam: string;
    fractie: string | null;
  }[];
}