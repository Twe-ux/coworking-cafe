"use client";

import SlideDown from "../../../utils/animations/slideDown";
import SlideUp from "../../../utils/animations/slideUp";
import { useEffect, useState } from "react";

interface Drink {
  _id: string;
  name: string;
  description?: string;
  image?: string;
}

interface MenuCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  drinks: Drink[];
}

interface MenuProps {
  type?: "drink" | "food";
  title?: string;
  subtitle?: string;
}

const Menu = ({
  type = "drink",
  title = "Nos Boissons",
  subtitle = "Découvrez notre sélection de boissons, toutes incluses dans votre forfait temps.",
}: MenuProps) => {
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/drinks?type=${type}`);
        if (res.ok) {
          const data = await res.json();
          setMenu(data.menu);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [type]);

  if (loading) {
    return (
      <section className="menu__section py__130">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </section>
    );
  }

  if (menu.length === 0) {
    return (
      <section className="menu__section py__130">
        <div className="container text-center">
          <p className="text-muted">Le menu sera bientôt disponible.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="menu__section pb__130 pt__50 ">
      <div className="container">
        <SlideDown className="text-center mb-5">
          <h1 className="title">{title}</h1>
          <p className="mt-3">{subtitle}</p>
        </SlideDown>

        {menu.map((category, categoryIndex) => (
          <div key={category._id} className="menu__category mb-5">
            <SlideUp delay={categoryIndex}>
              <h2 className="menu__category-title mb-4">{category.name}</h2>
              {category.description && (
                <p className="cat-p">{category.description}</p>
              )}
            </SlideUp>

            <div className="menu__drinks-scroll">
              {category.drinks.map((drink, drinkIndex) => (
                <SlideUp
                  key={drink._id}
                  className="menu__drink-item"
                  delay={drinkIndex}
                >
                  <div className="menu__drink-card">
                    {drink.image ? (
                      <div className="menu__drink-image">
                        <img src={drink.image} alt={drink.name} />
                      </div>
                    ) : (
                      <div className="menu__drink-image menu__drink-image--placeholder">
                        <i className="bi bi-cup-hot"></i>
                      </div>
                    )}
                    <div className="menu__drink-content">
                      <h3 className="menu__drink-name">{drink.name}</h3>
                      {drink.description && (
                        <p className="menu__drink-description">
                          {drink.description}
                        </p>
                      )}
                    </div>
                  </div>
                </SlideUp>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Menu;
