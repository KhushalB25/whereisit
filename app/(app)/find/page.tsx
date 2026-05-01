import { Suspense } from "react";
import { FindClient } from "@/components/find/FindClient";
import { LoadingState } from "@/components/ui/LoadingState";

export const metadata = {
  title: "Find It"
};

export default function FindPage() {
  return (
    <Suspense fallback={<LoadingState label="Preparing search" />}>
      <FindClient />
    </Suspense>
  );
}
