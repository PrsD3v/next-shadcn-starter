import { Role } from "./role";

export type User = {
  id: number;
  publcId: string;
  phone: string;
  passwordHash?: string;
  roles: Role[];
};
