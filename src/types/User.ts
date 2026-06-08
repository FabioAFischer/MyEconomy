export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  birthDate: string;
};

export type AuthResult = {
  success: boolean;
  error?: string;
};
