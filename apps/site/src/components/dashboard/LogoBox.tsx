"use client";

import { useLayoutContext } from "../../context/useLayoutContext";
import Image from "next/image";
import logoDark from "/public/images/logo-black.svg";
import logoLight from "/public/images/logo_white.svg";

const LogoBox = () => {
  const { menu } = useLayoutContext();
  const isCondensed = menu.size === "condensed";

  return (
    <a href={"/"}>
      <div
        className="logo-box"
        style={{ display: "flex", alignItems: "center", gap: "12px" }}
      >
        <div className="logo-img" style={{ flexShrink: 0 }}>
          <div className="logo-dark">
            <Image
              width={40}
              height={40}
              src={logoDark}
              className="logo-sm"
              alt="logo sm"
            />
            <Image
              width={40}
              height={40}
              src={logoDark}
              className="logo-lg"
              alt="logo dark"
            />
          </div>
          <div className="logo-light">
            <Image
              width={40}
              height={40}
              src={logoLight}
              className="logo-sm"
              alt="logo sm"
            />
            <Image
              width={40}
              height={40}
              src={logoLight}
              className="logo-lg"
              alt="logo light"
            />
          </div>
        </div>
        {!isCondensed && (
          <span
            className="logo-text"
            style={{
              fontWeight: 600,
              fontSize: "18px",
              whiteSpace: "nowrap",
              color: "var(--ct-menu-item-color)",
              transition: "opacity 0.3s",
            }}
          >
            CoworKing Café by Anticafé
          </span>
        )}
      </div>
    </a>
  );
};

export default LogoBox;
