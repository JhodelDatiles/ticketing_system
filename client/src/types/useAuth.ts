export type Role = "admin" | "agent" | "customer";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
}