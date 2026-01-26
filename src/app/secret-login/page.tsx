"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flex, Spinner, Text, Column } from "@once-ui-system/core";

export default function SecretEntry() {
  const router = useRouter();

  useEffect(() => {
    // Set the cookie that middleware checks
    // max-age=2592000 (30 days)
    document.cookie = "admin-access=true; path=/; max-age=2592000; SameSite=Lax"; 
    
    // Redirect to the actual admin path
    router.push("/keystatic");
  }, [router]);

  return (
    <Column fillWidth style={{ height: "100vh" }} vertical="center" horizontal="center" gap="32">
      <Spinner size="l" />
      <Text>Accessing Secure Area...</Text>
    </Column>
  );
}
