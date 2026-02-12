import { IconChevronDown } from "@/components/icons/CriticalIcons";
import { menuData, MenuItem } from "../../../db/menuData";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface NavbarProps {
  activeNavbar: boolean;
  onClose: () => void;
}

const Navbar = ({ activeNavbar, onClose }: NavbarProps) => {
  const [activeDropDownId, setActiveDropdownId] = useState<number | null>(null);
  const handeDropDown = (index: number, isDropdown?: MenuItem["submenu"]) => {
    if (isDropdown?.length) {
      setActiveDropdownId(activeDropDownId === index ? null : index);
    }
  };
  return (
    <>
      {/* Overlay pour fermer la navbar en mobile */}
      {activeNavbar && (
        <div className="navbar-overlay d-xl-none" onClick={onClose} />
      )}
      <nav
        className={`header__bottom_navbar ${
          activeNavbar
            ? "header__bottom_navbar-active"
            : "position-absolute px-4 mx-5"
        } `}
      >
        <ul className="d-xl-flex menu__list">
          {menuData?.map((item, index) => (
            <li key={index} className="dropdown__container">
              <span
                className="d-flex justify-content-between align-items-center gap-1"
                onClick={() => handeDropDown(index, item.submenu)}
              >
                <Link href={item.link} onClick={onClose}>
                  {item.title}
                </Link>
                {item?.submenu && <IconChevronDown size={12} />}
              </span>
              {item?.submenu && (
                <ul
                  className={`dropdown__container_menu ${
                    activeDropDownId === index
                      ? "dropdown__container_menu-active"
                      : ""
                  } `}
                >
                  {item?.submenu?.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      <Link href={subItem.link} onClick={onClose}>
                        {subItem.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}

          {/* Bouton Réserver visible uniquement en mobile */}
          <li className="d-xl-none mobile-cta-wrapper">
            <Link
              href="/booking"
              className="common__btn mobile-reserve-btn"
              onClick={onClose}
            >
              <span>Réserver</span>
              <Image
                src="/icons/arrow-up-right.svg"
                alt="Icône lien externe"
                width={16}
                height={16}
                loading="lazy"
              />
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
