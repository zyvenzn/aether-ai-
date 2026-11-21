import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ChatApp from "@/components/chat/ChatApp";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Chat — AETHER.ai",
  description: "Ngobrol dengan asisten AI AETHER.",
};

export default async function ChatPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    redirect("/login?next=/chat");
  }

  return <ChatApp />;
}