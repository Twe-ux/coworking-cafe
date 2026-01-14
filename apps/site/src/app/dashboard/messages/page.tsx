'use client';

import { useEffect } from 'react';
import { useTopbarContext } from "@/context/useTopbarContext";
import { ChatProvider } from "@/context/useChatContext";
import type { Metadata } from "next";
import { Row } from "react-bootstrap";
import ChatApp from './components/ChatApp';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const ChatPage = () => {
  const { setPageTitle, setPageActions } = useTopbarContext();

  useEffect(() => {
    setPageTitle('Messages');
    setPageActions(null);

    return () => {
      setPageTitle('Dashboard');
      setPageActions(null);
    };
  }, [setPageTitle, setPageActions]);

  return (
    <>
      <Row className="g-1">
        <ChatProvider>
          <ChatApp />
        </ChatProvider>
      </Row>
    </>
  );
};

export default ChatPage;
