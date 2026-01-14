"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Row,
  Col,
  Table,
  Badge,
  Alert,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import IconifyIcon from "@/components/dashboard/wrappers/IconifyIcon";
import { useTopbarContext } from "@/context/useTopbarContext";

interface UserData {
  id: string;
  email: string;
  username: string;
  givenName: string;
  role: {
    name: string;
    slug: string;
    level: number;
  };
  hasAccount: boolean;
  newsletter: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  deletedAt?: Date;
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [newsletterFilter, setNewsletterFilter] = useState<string>("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    total: 0,
    withAccount: 0,
    active: 0,
    newsletter: 0,
  });
  const { setPageTitle, setPageActions } = useTopbarContext();

  useEffect(() => {
    setPageTitle('Gestion des utilisateurs');
    setPageActions(null);

    return () => {
      setPageTitle('Dashboard');
      setPageActions(null);
    };
  }, [setPageTitle, setPageActions]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, newsletterFilter, accountFilter]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des utilisateurs");
      }

      const data = await response.json();
      setUsers(data.users || []);
      setStats({
        total: data.total || 0,
        withAccount: data.withAccount || 0,
        active: data.active || 0,
        newsletter: data.newsletter || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(term) ||
          user.givenName.toLowerCase().includes(term) ||
          user.username.toLowerCase().includes(term)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role.slug === roleFilter);
    }

    // Newsletter filter
    if (newsletterFilter === "subscribed") {
      filtered = filtered.filter((user) => user.newsletter);
    } else if (newsletterFilter === "not-subscribed") {
      filtered = filtered.filter((user) => !user.newsletter);
    }

    // Account filter
    if (accountFilter === "with-account") {
      filtered = filtered.filter((user) => user.hasAccount);
    } else if (accountFilter === "email-only") {
      filtered = filtered.filter((user) => !user.hasAccount);
    }

    setFilteredUsers(filtered);
  };

  const formatDate = (date?: Date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleBadgeColor = (slug: string) => {
    switch (slug) {
      case "dev":
        return "danger";
      case "admin":
        return "warning";
      case "staff":
        return "info";
      default:
        return "primary";
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer l'utilisateur "${userEmail}" ?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      // Refresh the users list
      await fetchUsers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
    }
  };

  if (loading) {
    return (
      <>
        <Row>
          <Col xl={12}>
            <Card>
              <CardBody>
                <div className="text-center py-4">Chargement...</div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Row>
          <Col xl={12}>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      </>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <Row className="mb-3">
        <Col md={3}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <IconifyIcon
                    icon="ri:group-line"
                    className="text-primary"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h4 className="mb-0">{stats.total}</h4>
                  <p className="text-muted mb-0">Total</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <IconifyIcon
                    icon="ri:user-line"
                    className="text-success"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h4 className="mb-0">{stats.withAccount}</h4>
                  <p className="text-muted mb-0">Avec compte</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <IconifyIcon
                    icon="ri:mail-line"
                    className="text-warning"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h4 className="mb-0">{stats.total - stats.withAccount}</h4>
                  <p className="text-muted mb-0">Email seul</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <IconifyIcon
                    icon="ri:mail-check-line"
                    className="text-info"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="flex-grow-1 ms-3">
                  <h4 className="mb-0">{stats.newsletter}</h4>
                  <p className="text-muted mb-0">Newsletter</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
              <CardTitle as="h4">Liste des utilisateurs</CardTitle>
            </CardHeader>
            <CardBody>
              {/* Filters */}
              <Row className="mb-3">
                <Col md={3}>
                  <InputGroup>
                    <InputGroup.Text>
                      <IconifyIcon icon="ri:search-line" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={accountFilter}
                    onChange={(e) => setAccountFilter(e.target.value)}
                  >
                    <option value="all">Tous</option>
                    <option value="with-account">Avec compte</option>
                    <option value="email-only">Email seul</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="dev">Développeur</option>
                    <option value="admin">Administrateur</option>
                    <option value="staff">Staff</option>
                    <option value="client">Client</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={newsletterFilter}
                    onChange={(e) => setNewsletterFilter(e.target.value)}
                  >
                    <option value="all">Newsletter - Tous</option>
                    <option value="subscribed">Inscrits</option>
                    <option value="not-subscribed">Non inscrits</option>
                  </Form.Select>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Username</th>
                      <th>Type</th>
                      <th>Rôle</th>
                      <th>Newsletter</th>
                      <th>Date création</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          Aucun résultat
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.givenName}</td>
                          <td>{user.email}</td>
                          <td>
                            {user.username !== "-" ? (
                              <code>@{user.username}</code>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            {user.hasAccount ? (
                              <Badge bg="primary">
                                <IconifyIcon
                                  icon="ri:user-line"
                                  className="me-1"
                                />
                                Compte
                              </Badge>
                            ) : (
                              <Badge bg="warning">
                                <IconifyIcon
                                  icon="ri:mail-line"
                                  className="me-1"
                                />
                                Email
                              </Badge>
                            )}
                          </td>
                          <td>
                            {user.hasAccount ? (
                              <Badge bg={getRoleBadgeColor(user.role.slug)}>
                                {user.role.name}
                              </Badge>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            {user.newsletter ? (
                              <Badge bg="success">
                                <IconifyIcon
                                  icon="ri:check-line"
                                  className="me-1"
                                />
                                Inscrit
                              </Badge>
                            ) : (
                              <Badge bg="secondary">Non inscrit</Badge>
                            )}
                          </td>
                          <td>{formatDate(user.createdAt)}</td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(user.id, user.email)}
                            >
                              <IconifyIcon icon="ri:delete-bin-line" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>

              <div className="mt-3 text-muted">
                {filteredUsers.length} résultat
                {filteredUsers.length > 1 ? "s" : ""}
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
}
