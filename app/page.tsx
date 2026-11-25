import { redirect } from "next/navigation";
import { ChatApp } from "@/components/chat/ChatApp";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login");
  }

  return <ChatApp />;
}
