import {
  IconClock,
  IconFacebook,
  IconInstagram,
} from "@/components/icons/CriticalIcons";
import Link from "next/link";
import ProtectedEmail from "../../common/ProtectedEmail";

const TopHeader = () => {
  return (
    <div className="header__top d-lg-block d-none">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center header__top_left">
            <p className="d-flex align-items-center time">
              <IconClock size={14} />
              <span> &nbsp; Horaires :</span>
            </p>
            <p className="gap-2 d-flex align-items-center">
              <span>Lun-Ven :</span>
              <span>09h-20h</span>
            </p>
            <span className="line" />
            <p className="gap-2 d-flex align-items-center">
              <span>Sam-Dim & Jours fériés :</span>
              <span>10h-20h</span>
            </p>
          </div>
          <div className="d-flex align-items-center header__top_contact">
            <ProtectedEmail
              user="strasbourg"
              domain="coworkingcafe.fr"
              className="email"
            />
            <span className="line" />
            <ul className="d-flex align-items-center icons">
              <li>
                <Link href="https://www.facebook.com/coworkingbyanticafeStrasbourg">
                  <IconFacebook size={14} />
                </Link>
              </li>
              <li>
                <Link href="https://www.instagram.com/coworking_anticafe">
                  <IconInstagram size={14} />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHeader;
