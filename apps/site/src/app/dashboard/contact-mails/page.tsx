"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Table,
  Badge,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import IconifyIcon from "@/components/dashboard/wrappers/IconifyIcon";
import { useTopbarContext } from "@/context/useTopbarContext";

interface Message {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const { setPageTitle, setPageActions } = useTopbarContext();

  useEffect(() => {
    const unreadCount = messages.filter((m) => m.status === "unread").length;
    const title = unreadCount > 0
      ? `Messages de contact (${unreadCount})`
      : "Messages de contact";

    setPageTitle(title);
    setPageActions(
      <>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "8px 16px",
            background: filter === "all" ? "#667eea" : "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: filter === "all" ? "white" : "#374151",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            if (filter !== "all") {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
            } else {
              e.currentTarget.style.background = "#5568d3";
              e.currentTarget.style.borderColor = "#5568d3";
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== "all") {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e5e7eb";
            } else {
              e.currentTarget.style.background = "#667eea";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }
          }}
        >
          Tous
        </button>
        <button
          onClick={() => setFilter("unread")}
          style={{
            padding: "8px 16px",
            background: filter === "unread" ? "#667eea" : "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: filter === "unread" ? "white" : "#374151",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            if (filter !== "unread") {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
            } else {
              e.currentTarget.style.background = "#5568d3";
              e.currentTarget.style.borderColor = "#5568d3";
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== "unread") {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e5e7eb";
            } else {
              e.currentTarget.style.background = "#667eea";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }
          }}
        >
          Non lus
        </button>
        <button
          onClick={() => setFilter("read")}
          style={{
            padding: "8px 16px",
            background: filter === "read" ? "#667eea" : "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: filter === "read" ? "white" : "#374151",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            if (filter !== "read") {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
            } else {
              e.currentTarget.style.background = "#5568d3";
              e.currentTarget.style.borderColor = "#5568d3";
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== "read") {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e5e7eb";
            } else {
              e.currentTarget.style.background = "#667eea";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }
          }}
        >
          Lus
        </button>
        <button
          onClick={() => setFilter("replied")}
          style={{
            padding: "8px 16px",
            background: filter === "replied" ? "#667eea" : "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: filter === "replied" ? "white" : "#374151",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            if (filter !== "replied") {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
            } else {
              e.currentTarget.style.background = "#5568d3";
              e.currentTarget.style.borderColor = "#5568d3";
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== "replied") {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e5e7eb";
            } else {
              e.currentTarget.style.background = "#667eea";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }
          }}
        >
          Répondus
        </button>
        <button
          onClick={() => setFilter("archived")}
          style={{
            padding: "8px 16px",
            background: filter === "archived" ? "#667eea" : "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: filter === "archived" ? "white" : "#374151",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            if (filter !== "archived") {
              e.currentTarget.style.background = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
            } else {
              e.currentTarget.style.background = "#5568d3";
              e.currentTarget.style.borderColor = "#5568d3";
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== "archived") {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e5e7eb";
            } else {
              e.currentTarget.style.background = "#667eea";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }
          }}
        >
          Archivés
        </button>
      </>
    );

    return () => {
      setPageTitle("Dashboard");
      setPageActions(null);
    };
  }, [filter, messages, setPageTitle, setPageActions]);

  const refreshUnreadCount = () => {
    // Dispatch custom event to refresh unread count
    window.dispatchEvent(new Event("refreshUnreadCount"));
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/contact-mails?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message);
    setShowModal(true);

    // Mark as read if unread
    if (message.status === "unread") {
      try {
        const response = await fetch(`/api/contact-mails/${message._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "read" }),
        });

        if (response.ok) {
          await fetchMessages();
          // Small delay to ensure DB is updated
          setTimeout(() => refreshUnreadCount(), 100);
        }
      } catch (error) {
    }
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/contact-mails/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchMessages();
        setTimeout(() => refreshUnreadCount(), 100);
        setShowModal(false);
      }
    } catch (error) {
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setSending(true);
    try {
      const response = await fetch(
        `/api/contact-mails/${selectedMessage._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reply: replyText }),
        }
      );

      if (response.ok) {
        setShowReplyModal(false);
        setReplyText("");
        await fetchMessages();
        setTimeout(() => refreshUnreadCount(), 100);
        setShowModal(false);
      }
    } catch (error) {
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;

    try {
      const response = await fetch(`/api/contact-mails/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchMessages();
        setTimeout(() => refreshUnreadCount(), 100);
        setShowModal(false);
      }
    } catch (error) {
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      unread: "danger",
      read: "warning",
      replied: "success",
      archived: "secondary",
    };
    const labels: Record<string, string> = {
      unread: "Non lu",
      read: "Lu",
      replied: "Répondu",
      archived: "Archivé",
    };
    return <Badge bg={variants[status]}>{labels[status]}</Badge>;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="container-fluid">
      <Card>
        <CardBody>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <p className="text-muted text-center py-4">Aucun message</p>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Sujet</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr
                    key={message._id}
                    style={{
                      cursor: "pointer",
                      fontWeight:
                        message.status === "unread" ? "bold" : "normal",
                    }}
                    onClick={() => handleViewMessage(message)}
                  >
                    <td>{getStatusBadge(message.status)}</td>
                    <td>{formatDate(message.createdAt)}</td>
                    <td>{message.name}</td>
                    <td>{message.email}</td>
                    <td>{message.subject}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewMessage(message)}
                      >
                        <IconifyIcon icon="ri:eye-line" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* View Message Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Message de {selectedMessage?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMessage && (
            <div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <strong>Email:</strong> {selectedMessage.email}
                </div>
                <div className="col-md-6">
                  <strong>Téléphone:</strong>{" "}
                  {selectedMessage.phone || "Non renseigné"}
                </div>
              </div>
              <div className="mb-3">
                <strong>Sujet:</strong> {selectedMessage.subject}
              </div>
              <div className="mb-3">
                <strong>Date:</strong> {formatDate(selectedMessage.createdAt)}
              </div>
              <div className="mb-3">
                <strong>Statut:</strong>{" "}
                {getStatusBadge(selectedMessage.status)}
              </div>
              <hr />
              <div className="mb-3">
                <strong>Message:</strong>
                <p className="mt-2" style={{ whiteSpace: "pre-wrap" }}>
                  {selectedMessage.message}
                </p>
              </div>
              {selectedMessage.reply && (
                <>
                  <hr />
                  <div className="mb-3">
                    <strong>Réponse envoyée:</strong>
                    <p
                      className="mt-2 text-muted"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {selectedMessage.reply}
                    </p>
                    {selectedMessage.repliedAt && (
                      <small className="text-muted">
                        Répondu le {formatDate(selectedMessage.repliedAt)}
                      </small>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => handleUpdateStatus(selectedMessage!._id, "archived")}
          >
            <IconifyIcon icon="ri:archive-line" />
          </Button>
          {selectedMessage?.status !== "replied" && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => {
                setShowReplyModal(true);
                setShowModal(false);
              }}
            >
              <IconifyIcon icon="ri:reply-line" />
            </Button>
          )}
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDelete(selectedMessage!._id)}
          >
            <IconifyIcon icon="ri:delete-bin-line" />
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reply Modal */}
      <Modal
        show={showReplyModal}
        onHide={() => setShowReplyModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Répondre à {selectedMessage?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMessage && (
            <div>
              <div className="mb-3 p-3 bg-light rounded">
                <strong>Message original:</strong>
                <p className="mt-2 mb-0" style={{ whiteSpace: "pre-wrap" }}>
                  {selectedMessage.message}
                </p>
              </div>
              <Form.Group>
                <Form.Label>Votre réponse:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Écrivez votre réponse..."
                />
              </Form.Group>
              <small className="text-muted">
                La réponse sera envoyée à {selectedMessage.email}
              </small>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setShowReplyModal(false)}
          >
            <IconifyIcon icon="ri:close-line" />
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={handleReply}
            disabled={sending || !replyText.trim()}
          >
            <IconifyIcon icon="ri:send-plane-line" />
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MessagesPage;
