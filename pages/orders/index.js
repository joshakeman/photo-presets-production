import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Orders() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/account");
  }, [router]);

  return <p className="p-6">Opening your account…</p>;
}
