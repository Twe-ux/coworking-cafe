"use client";

import { useLayoutContext } from "../../../../../context/useLayoutContext";
import IconifyIcon from "../../../wrappers/IconifyIcon";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

const SidebarFooter = () => {
  const { theme, changeTheme, menu } = useLayoutContext();
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const isDark = theme === "dark";
  const isCondensed = menu.size === "condensed";

  // Get user initials
  const userName = session?.user?.name || "User";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Get appropriate colors based on theme
  const footerBorder = isDark
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";
  const menuBg = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
  const menuBgHover = isDark
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.08)";
  const settingsBg = isDark
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.08)";
  const settingsBgHover = isDark
    ? "rgba(255, 255, 255, 0.2)"
    : "rgba(0, 0, 0, 0.12)";
  const dropdownBg = isDark
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.08)";
  const dropdownHover = isDark
    ? "rgba(255, 255, 255, 0.15)"
    : "rgba(0, 0, 0, 0.12)";
  const textColor = isDark ? "white" : "#1e293b";

  return (
    <div
      className="sidebar-footer"
      style={{
        borderTop: `1px solid ${footerBorder}`,
        padding: "16px",
        // background: isDark ? "transparent" : "rgba(0, 0, 0, 0.02)",
      }}
    >
      <div
        className="user-menu"
        style={{
          background: menuBg,
          borderRadius: "12px",
          padding: "12px",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = menuBgHover)}
        onMouseLeave={(e) => (e.currentTarget.style.background = menuBg)}
      >
        {/* User Info */}
        <div
          className="user-info"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        >
          <div
            className="user-avatar"
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              flexShrink: 0,
              color: "white",
            }}
          >
            {initials}
          </div>
          {!isCondensed && (
            <div
              className="user-details"
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <div
                className="user-name"
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: textColor,
                }}
              >
                {userName}
              </div>
              <div
                className="user-role"
                style={{
                  fontSize: "12px",
                  color: isDark
                    ? "rgba(255, 255, 255, 0.6)"
                    : "rgba(0, 0, 0, 0.5)",
                }}
              >
                {session?.user?.role?.name || "User"}
              </div>
            </div>
          )}
        </div>

        {/* Settings Row */}
        {!isCondensed && (
          <div
            className="settings-row"
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "12px",
            }}
          >
            <button
              className="settings-btn"
              title={isDark ? "Mode clair" : "Mode sombre"}
              onClick={(e) => {
                e.stopPropagation();
                changeTheme(isDark ? "light" : "dark");
              }}
              style={{
                flex: 1,
                padding: "8px",
                background: settingsBg,
                border: "none",
                borderRadius: "8px",
                color: textColor,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = settingsBgHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = settingsBg)
              }
            >
              {isDark ? (
                <IconifyIcon icon="ri:sun-line" className="fs-18" />
              ) : (
                <IconifyIcon icon="ri:moon-line" className="fs-18" />
              )}
            </button>
            <button
              className="settings-btn"
              title="Notifications"
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                padding: "8px",
                background: settingsBg,
                border: "none",
                borderRadius: "8px",
                color: textColor,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = settingsBgHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = settingsBg)
              }
            >
              <IconifyIcon icon="ri:notification-3-line" className="fs-18" />
            </button>
            <button
              className="settings-btn"
              title="Paramètres"
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                padding: "8px",
                background: settingsBg,
                border: "none",
                borderRadius: "8px",
                color: textColor,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = settingsBgHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = settingsBg)
              }
            >
              <IconifyIcon icon="ri:settings-3-line" className="fs-18" />
            </button>
          </div>
        )}

        {/* User Dropdown Menu */}
        {isUserMenuOpen && !isCondensed && (
          <div
            className="user-dropdown"
            style={{
              marginTop: "12px",
              background: dropdownBg,
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <Link
              href="/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                color: textColor,
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = dropdownHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <IconifyIcon icon="solar:calendar-broken" className="fs-18" />
              <span style={{ fontSize: "14px" }}>Mon Agenda</span>
            </Link>
            <Link
              href="/dashboard/pages/pricing"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                color: textColor,
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = dropdownHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <IconifyIcon icon="solar:wallet-broken" className="fs-18" />
              <span style={{ fontSize: "14px" }}>Tarifs</span>
            </Link>
            <Link
              href="/dashboard/pages/faqs"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                color: textColor,
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = dropdownHover)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <IconifyIcon icon="solar:help-broken" className="fs-18" />
              <span style={{ fontSize: "14px" }}>Aide</span>
            </Link>
            <div
              style={{
                height: "1px",
                background: footerBorder,
                margin: "4px 0",
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                signOut({ callbackUrl: "/auth/login" });
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                width: "100%",
                background: "transparent",
                border: "none",
                color: "#ef4444",
                textDecoration: "none",
                cursor: "pointer",
                fontSize: "14px",
                textAlign: "left",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <IconifyIcon icon="solar:logout-3-broken" className="fs-18" />
              <span>Déconnexion</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarFooter;
