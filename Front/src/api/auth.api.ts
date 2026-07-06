import http from "./http";

export const login = (username: string, password: string) =>
  http.post("/auth/login", { username, password });

export const validateToken = () => http.get("/auth/validate");

export const getUserProfile = () => http.get("/auth/me");
