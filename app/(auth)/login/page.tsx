import { AuthCard } from "@/components/auth/AuthCard";
import { Suspense } from "react";

export const metadata = {
  title: "Log in"
};

export default function LoginPage() {
  return (
    <Suspense>
      <AuthCard mode="login" />
    </Suspense>
  );
}
