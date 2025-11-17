
export interface Facture {
  id?: number;
  patientId: number;
  montant: number;
  date: Date;
  statut: string;
  description?: string;
}
