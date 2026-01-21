import { options } from "../../../../lib/auth-options";
import dbConnect from "../../../../lib/mongodb";
import { User } from "../../../../models/user";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import SecuritySection from "./SecuritySection";
import DangerZone from "./DangerZone";
import "./profile.scss";

// Force dynamic rendering - don't pre-render at build time
export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: { id: string };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(options);

  // Check if user is authenticated
  if (!session) {
    redirect(`/auth/login?callbackUrl=/${params.id}/profile`);
  }

  // Check if user has a username
  if (!session.user.username) {
    redirect("/auth/login");
  }

  // Security check: verify the URL username matches the logged-in user
  if (params.id !== session.user.username) {
    // Redirect to their own profile
    redirect(`/${session.user.username}/profile`);
  }

  const username = session.user.username;

  // Fetch user profile including phone and companyName from database
  let userPhone = "";
  let userCompanyName = "";
  try {
    await dbConnect();
    const user = await User.findOne({ email: session.user.email }).select(
      "phone companyName",
    );
    if (user?.phone) {
      userPhone = user.phone;
    }
    if (user?.companyName) {
      userCompanyName = user.companyName;
    }
  } catch (error) {}

  return (
    <section className="client-dashboard py__90" style={{ minHeight: "130vh" }}>
      <div className="container mb-5">
        {/* Welcome Card with Profile Info */}
        <div className="welcome-card mb-4" style={{ padding: "2rem" }}>
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h1 className="welcome-title mb-2">Mon Profil</h1>
              <p className="welcome-text mb-0" style={{ fontSize: "0.95rem" }}>
                Gérez vos informations personnelles et sécurisez votre compte
              </p>
            </div>
            <div className="col-lg-5">
              <div
                className="d-flex align-items-center justify-content-end gap-4"
                style={{ paddingRight: "2rem" }}
              >
                <div
                  className="text-start mt-3"
                  style={{ paddingRight: "1rem" }}
                >
                  <h5
                    className="mb-1"
                    style={{
                      fontWeight: "600",
                      color: "#fff",
                      fontSize: "1.1rem",
                    }}
                  >
                    {session.user.name}
                  </h5>
                  <p
                    className="mb-1"
                    style={{ color: "#fff", fontSize: "0.85rem" }}
                  >
                    @{session.user.username}
                  </p>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "65px",
                    height: "65px",
                    fontSize: "1.75rem",
                    backgroundColor: "#f2d381",
                    color: "#142220",
                    fontWeight: "700",
                  }}
                >
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="row">
          <div className="col-lg-8">
            <ProfileClient
              name={session.user.name || ""}
              email={session.user.email || ""}
              username={username}
              roleName={session.user.role.name}
              phone={userPhone}
              companyName={userCompanyName}
            />
          </div>

          <div className="col-lg-4">
            {/* Quick Actions */}
            <div className="mb-4">
              <h3 className="section-title">Actions rapides</h3>
            </div>
            <div className="d-grid gap-3">
              <Link
                href={`/${username}`}
                className="btn d-flex align-items-center justify-content-start gap-3"
                style={{
                  backgroundColor: "#e3ece7",
                  color: "#142220",
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                  border: "none",
                  textAlign: "left",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#417972",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <i
                    className="bi bi-house"
                    style={{ fontSize: "1.25rem" }}
                  ></i>
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "1rem" }}>
                    Dashboard
                  </div>
                  <small style={{ color: "#6e6f75" }}>Retour à l'accueil</small>
                </div>
              </Link>
              <Link
                href={`/${username}/reservations`}
                className="btn d-flex align-items-center justify-content-start gap-3"
                style={{
                  backgroundColor: "#e3ece7",
                  color: "#142220",
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                  border: "none",
                  textAlign: "left",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#417972",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <i
                    className="bi bi-calendar-check"
                    style={{ fontSize: "1.25rem" }}
                  ></i>
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "1rem" }}>
                    Réservations
                  </div>
                  <small style={{ color: "#6e6f75" }}>
                    Gérer mes réservations
                  </small>
                </div>
              </Link>
              {/* <Link
                href={`/${username}/settings`}
                className="btn d-flex align-items-center justify-content-start gap-3"
                style={{
                  backgroundColor: "#e3ece7",
                  color: "#142220",
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                  border: "none",
                  textAlign: "left",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#417972",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <i className="bi bi-gear" style={{ fontSize: "1.25rem" }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "1rem" }}>
                    Paramètres
                  </div>
                  <small style={{ color: "#6e6f75" }}>
                    Configurer le compte
                  </small>
                </div>
              </Link> */}
            </div>

            {/* Security Section */}
            <SecuritySection />
          </div>
        </div>
        <DangerZone />
      </div>
    </section>
  );
}
