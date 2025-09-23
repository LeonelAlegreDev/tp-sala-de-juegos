export interface IUser {
    id: string;
    email: string;
    role: "admin" | "client",
}