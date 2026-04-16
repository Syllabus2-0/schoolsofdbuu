import { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function RequireRole({
  allowed,
  children,
}: {
  allowed: string[];
  children: ReactNode;
}) {
  const { currentUser } = useAuth() as any;
  if (!currentUser) return <Navigate to="/login" />;
  if (!allowed.includes(currentUser.role)) return <Navigate to="/login" />;
  return <>{children}</>;
}
