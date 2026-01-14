'use client'
import { Col, Offcanvas, Spinner } from 'react-bootstrap'
import ChatArea from './ChatArea'
import ChatLeftSidebar from './ChatLeftSidebar'
import { useChatContext } from '@/context/useChatContext'

const ChatApp = () => {
  const {
    conversations,
    activeConversation,
    loadingConversations,
    chatList,
    selectConversation
  } = useChatContext()

  // Show loading state
  if (loadingConversations && conversations.length === 0) {
    return (
      <Col className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Chargement des conversations...</p>
      </Col>
    )
  }

  // Show empty state
  if (!loadingConversations && conversations.length === 0) {
    return (
      <Col className="text-center py-5">
        <div className="mb-4">
          <i className="bi bi-chat-dots fs-1 text-muted"></i>
        </div>
        <h5 className="text-muted">Aucune conversation</h5>
        <p className="text-muted">
          Vous n'avez pas encore de conversations.
        </p>
      </Col>
    )
  }

  return (
    <>
      <Col xxl={3}>
        <Offcanvas
          show={chatList.open}
          onHide={chatList.toggle}
          className="offcanvas-xxl offcanvas-start h-100"
          tabIndex={-1}
          id="Contactoffcanvas"
          aria-labelledby="ContactoffcanvasLabel">
          <ChatLeftSidebar
            conversations={conversations}
            activeConversation={activeConversation}
            onConversationSelect={selectConversation}
          />
        </Offcanvas>
        <div className="d-none d-xxl-block">
          <ChatLeftSidebar
            conversations={conversations}
            activeConversation={activeConversation}
            onConversationSelect={selectConversation}
          />
        </div>
      </Col>

      <Col xxl={9}>
        {activeConversation ? (
          <ChatArea conversation={activeConversation} />
        ) : (
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="bi bi-chat-text fs-1 text-muted"></i>
            </div>
            <h5 className="text-muted">Sélectionnez une conversation</h5>
            <p className="text-muted">
              Choisissez une conversation à gauche pour commencer à discuter.
            </p>
          </div>
        )}
      </Col>
    </>
  )
}

export default ChatApp
