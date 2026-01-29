"use client";

import { useEffect, useState } from "react";
import Menu from "../../../components/site/menu/menu";
import PageTitle from "../../../components/site/PageTitle";

type MenuType = "drink" | "food" | "grocery" | "goodies";

interface TabConfig {
  type: MenuType;
  label: string;
  title: string;
  subtitle: string;
}

const allTabs: TabConfig[] = [
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
    subtitle: "Retrouvez nos produits d'épicerie pour vos pauses gourmandes.",
  },
  {
    type: "goodies",
    label: "Goodies",
    title: "Nos Goodies",
    subtitle: "Découvrez nos produits dérivés et goodies du CoworKing Café.",
  },
];

const MenuPage = () => {
  const [availableTabs, setAvailableTabs] = useState<TabConfig[]>([]);
  const [activeTab, setActiveTab] = useState<MenuType | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger les onglets disponibles au montage
  useEffect(() => {
    const checkAvailableTabs = async () => {
      const tabsWithItems: TabConfig[] = [];

      // Vérifier chaque type pour voir s'il a des items
      for (const tab of allTabs) {
        try {
          const res = await fetch(`/api/drinks?type=${tab.type}`);
          if (res.ok) {
            const data = await res.json();
            // Compter le nombre total d'items dans toutes les catégories
            const totalItems = data.menu.reduce(
              (sum: number, category: any) =>
                sum + (category.drinks?.length || 0),
              0,
            );
            if (totalItems > 0) {
              tabsWithItems.push(tab);
            }
          }
        } catch (error) {
          console.error(`Error checking ${tab.type}:`, error);
        }
      }

      setAvailableTabs(tabsWithItems);

      // Définir le premier onglet disponible comme actif
      if (tabsWithItems.length > 0) {
        setActiveTab(tabsWithItems[0].type);
      }

      setLoading(false);
    };

    checkAvailableTabs();
  }, []);

  const activeTabConfig =
    availableTabs.find((tab) => tab.type === activeTab) || availableTabs[0];

  // Afficher un loader pendant la vérification des onglets
  if (loading) {
    return (
      <>
        <PageTitle title="Notre Menu" />
        <section className="menu__section py__130">
          <div className="container text-center">
            <div
              className="spinner-border"
              role="status"
              style={{ color: "#142220", borderRightColor: "transparent" }}
            >
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Si aucun onglet n'a d'items
  if (availableTabs.length === 0) {
    return (
      <>
        <PageTitle title="Notre Menu" />
        <section className="menu__section py__130">
          <div className="container text-center">
            <p className="text-muted">Le menu sera bientôt disponible.</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Notre Menu" />

      {/* N'afficher les onglets que s'il y en a plusieurs */}
      {availableTabs.length > 1 && (
        <section className="menu__tabs-section pt__50 pb__50">
          <div className="container">
            <ul className="nav nav-tabs justify-content-center" role="tablist">
              {availableTabs.map((tab) => (
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
      )}

      {activeTab && activeTabConfig && (
        <Menu
          type={activeTab}
          title={activeTabConfig.title}
          subtitle={activeTabConfig.subtitle}
        />
      )}
    </>
  );
};

export default MenuPage;
