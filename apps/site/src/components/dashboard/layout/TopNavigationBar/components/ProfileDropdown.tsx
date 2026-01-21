"use client";

import avatar1 from "@/assets/dashboard/images/users/avatar-1.jpg";
import IconifyIcon from "../../../wrappers/IconifyIcon";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Dropdown,
  DropdownHeader,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from "react-bootstrap";

const ProfileDropdown = () => {
  return (
    <Dropdown className="topbar-item" drop="down">
      <DropdownToggle
        as={"a"}
        type="button"
        className="topbar-button content-none"
        id="page-header-user-dropdown "
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        <span className="d-flex align-items-center">
          <Image
            className="rounded-circle"
            width={32}
            src={avatar1}
            alt="avatar-3"
          />
        </span>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end">
        <DropdownHeader as={"h6"} className="dropdown-header">
          Welcome Gaston!
        </DropdownHeader>
        <DropdownItem as={Link} href="/profile">
          <IconifyIcon
            icon="solar:calendar-broken"
            className="align-middle me-2 fs-18"
          />
          <span className="align-middle">My Schedules</span>
        </DropdownItem>
        <DropdownItem as={Link} href="/dashboard/pages/pricing">
          <IconifyIcon
            icon="solar:wallet-broken"
            className="align-middle me-2 fs-18"
          />
          <span className="align-middle">Pricing</span>
        </DropdownItem>
        <DropdownItem as={Link} href="/dashboard/pages/faqs">
          <IconifyIcon
            icon="solar:help-broken"
            className="align-middle me-2 fs-18"
          />
          <span className="align-middle">Help</span>
        </DropdownItem>
        <div className="dropdown-divider my-1" />
        <DropdownItem
          className="text-danger"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          style={{ cursor: "pointer" }}
        >
          <IconifyIcon
            icon="solar:logout-3-broken"
            className="align-middle me-2 fs-18"
          />
          <span className="align-middle">Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

export default ProfileDropdown;
