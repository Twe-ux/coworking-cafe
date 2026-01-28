"use client";

import { useState } from "react";
import Menu from "../../../components/site/menu/menu";
import PageTitle from "../../../components/site/pageTitle";

type MenuType = "drink" | "food" | "grocery" | "goodies";

interface TabConfig {
  type: MenuType;
  label: string;
  title: string;
  subtitle: string;
}

const tabs: TabConfig[] = [
  {
    type: "drink",
    label: "Boissons",
    title: "Nos Boissons",
    subtitle:
      "Découvrez notre sélection de boissons, toutes incluses dans votre forfait temps.",
  },
  {
    type: "food",
    label: "Nourriture",
    title: "Nos Produits Alimentaires",
    subtitle:
      "Découvrez notre sélection de produits alimentaires, disponibles à la carte.",
  },
  {
    type: "grocery",
    label: "Épicerie",
    title: "Notre Épicerie",
    subtitle:
      "Retrouvez nos produits d'épicerie pour vos pauses gourmandes.",
  },
  {
    type: "goodies",
    label: "Goodies",
    title: "Nos Goodies",
    subtitle: "Découvrez nos produits dérivés et goodies du CoworKing Café.",
  },
];

const MenuPage = () => {
  const [activeTab, setActiveTab] = useState<MenuType>("drink");

  const activeTabConfig = tabs.find((tab) => tab.type === activeTab) || tabs[0];

  return (
    <>
      <PageTitle title="Notre Menu" />

      <section className="menu__tabs-section pt__50 pb__50">
        <div className="container">
          <ul className="nav nav-tabs justify-content-center" role="tablist">
            {tabs.map((tab) => (
              <li key={tab.type} className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === tab.type ? "active" : ""}`}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.type}
                  onClick={() => setActiveTab(tab.type)}
                  style={{
                    fontWeight: activeTab === tab.type ? "600" : "normal",
                    color: activeTab === tab.type ? "#588983" : "#142220",
                    borderBottomColor:
                      activeTab === tab.type ? "#588983" : "transparent",
                    borderBottomWidth: activeTab === tab.type ? "3px" : "1px",
                  }}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Menu
        type={activeTab}
        title={activeTabConfig.title}
        subtitle={activeTabConfig.subtitle}
      />
    </>
  );
};

export default MenuPage;
