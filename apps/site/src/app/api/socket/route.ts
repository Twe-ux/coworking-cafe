import { NextRequest } from "next/server";
import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

// This will be called once to initialize Socket.IO

// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  const res = new Response("Socket.IO server initialized", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });

  // Initialize Socket.IO if not already done
  // Note: This is a simplified approach for Next.js
  // In production, you might want to use a separate server

  return res;
}

// Socket.IO logic will be handled in a separate initialization file
// This route is mainly for health checks
