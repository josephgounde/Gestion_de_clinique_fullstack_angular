
export interface NotificationDto {
  objMessage: string;  // "NEW_RDV", "RDV_CANCELLED", "RDV_REMINDER"
  message: string;
  rdvId: number | null;
  timestamp: string;
  recipientType: 'MEDECIN' | 'SECRETAIRE' | 'PATIENT';
  recipientId: number;
  isRead?: boolean;
}