import { createFileRoute } from "@tanstack/react-router";

import { handleConciergeChat } from "@/lib/ai/concierge.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: ({ request }) => handleConciergeChat(request),
    },
  },
});
