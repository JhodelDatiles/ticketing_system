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

export interface Comment {
  id: number;
  ticket_id: number;
  user_id: number;
  message: string;
  created_at: string;
}

export interface Attachment {
  id: number;
  ticket_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_by: number;
  uploaded_at: string;
}