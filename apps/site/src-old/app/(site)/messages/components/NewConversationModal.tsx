"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import avatar1 from "@/assets/dashboard/images/users/avatar-1.jpg";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

interface NewConversationModalProps {
  show: boolean;
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
}

export default function NewConversationModal({
  show,
  onClose,
  onConversationCreated,
}: NewConversationModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (show) {
      fetchUsers();
    }
  }, [show, searchText]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchText) {
        params.append("search", searchText);
      }
      const response = await fetch(`/api/users/available?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (userId: string) => {
    try {
      setCreating(true);
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantIds: [userId],
          type: "direct",
        }),
      });

      const data = await response.json();

      if (data.success) {
        onConversationCreated(data.data._id);
        onClose();
      } else {
        alert("Erreur lors de la création de la conversation");
      }
    } catch (error) {      alert("Erreur lors de la création de la conversation");
    } finally {
      setCreating(false);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1050 }}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Nouvelle conversation</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={creating}
              ></button>
            </div>
            <div className="modal-body">
              {/* Search */}
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un utilisateur..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              {/* Users list */}
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-person-x display-4 mb-2"></i>
                  <p>Aucun utilisateur trouvé</p>
                </div>
              ) : (
                <div className="list-group">
                  {users.map((user) => (
                    <button
                      key={user._id}
                      className="list-group-item list-group-item-action"
                      onClick={() => createConversation(user._id)}
                      disabled={creating}
                    >
                      <div className="d-flex align-items-center">
                        <Image
                          src={user.avatar || avatar1}
                          alt={user.name}
                          width={40}
                          height={40}
                          className="rounded-circle me-3"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="flex-grow-1">
                          <h6 className="mb-0">{user.name}</h6>
                          <small className="text-muted">{user.email}</small>
                        </div>
                        {user.role === "admin" && (
                          <span className="badge bg-primary">Admin</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={creating}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
