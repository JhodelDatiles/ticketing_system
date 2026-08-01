export interface Ticket {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  category_id: number;
  priority_id: number;
  status_id: number;
  created_by: number;
  assigned_to: number | null;
  created_at: string;
  closed_at: string | null;
}

export interface LookupItem {
  id: number;
  name: string;
}