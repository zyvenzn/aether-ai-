import type { Metadata } from "next";
import ChatApp from "@/components/chat/ChatApp";

export const metadata: Metadata = {
  title: "Chat — AETHER.ai",
  description: "Ngobrol dengan asisten AI AETHER.",
};

export default function ChatPage() {
  return <ChatApp />;
}
