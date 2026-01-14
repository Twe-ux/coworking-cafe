"use client";
import IconifyIcon from "@/components/dashboard/wrappers/IconifyIcon";
import { useLayoutContext } from "@/context/useLayoutContext";
import useViewPort from "@/hooks/useViewPort";
import { useEffect } from "react";

const HoverMenuToggle = () => {
  const {
    menu: { size },
    changeMenu: { size: changeMenuSize },
  } = useLayoutContext();
  const { width } = useViewPort();

  useEffect(() => {
    if (width <= 1140) {
      if (size !== "hidden") changeMenuSize("hidden");
    }
  }, [width]);

  const handleToggleMenu = () => {
    // Toggle between condensed and default (expanded) states
    if (size === "condensed") {
      changeMenuSize("default");
    } else if (size === "default") {
      changeMenuSize("condensed");
    } else if (size === "sm-hover-active") {
      changeMenuSize("sm-hover");
    } else if (size === "sm-hover") {
      changeMenuSize("sm-hover-active");
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleMenu}
      className="button-sm-hover"
      aria-label="Toggle Sidebar"
    >
      <IconifyIcon
        height={24}
        width={24}
        icon="ri:menu-2-line"
        className="button-sm-hover-icon"
      />
    </button>
  );
};

export default HoverMenuToggle;
