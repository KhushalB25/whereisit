import { AuthCard } from "@/components/auth/AuthCard";
import { Suspense } from "react";

export const metadata = {
  title: "Sign up"
};

export default function SignupPage() {
  return (
    <Suspense>
      <AuthCard mode="signup" />
    </Suspense>
  );
}
