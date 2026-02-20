/**
 * PROPOSITION SIMPLE: Remplacement des images selon le PDF
 *
 * Cette version garde EXACTEMENT la structure actuelle
 * et remplace juste les images placeholder par les vraies
 *
 * Pour appliquer: Copier le contenu dans page.tsx
 */

import Image from "next/image";
import PageTitle from "../../../components/site/PageTitle";
import SlideUp from "../../../utils/animations/slideUp";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Take Away | CoworKing Café by Anticafé",
  description: `Coffee shop à Strasbourg : boissons à emporter, cafés glacés et frappés, matcha latte, citronnades, smoothies, encas sucrés, pizzas faites maison et petite épicerie. Tout pour une pause gourmande à savourer où vous voulez.`,
  openGraph: {
    title: "Take Away - CoworKing Café by Anticafé",
    description: "Découvrez CoworKing Café by Anticafé à Strasbourg.",
    type: "website",
    images: [
      {
        url: "/images/og-image.webp",
        width: 1200,
        height: 630,
        alt: "CoworKing Café - Take Away",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/images/og-image.webp"],
  },
  alternates: {
    canonical: "https://coworkingcafe.fr/take-away",
  },
};

const TakeAway = () => {
  return (
    <>
      <PageTitle title={"Take Away"} />
      <article className="concept py__130">
        <div className="container pb__130 pb-md-5 mb-md-5">
          {/* PAGE 2 PDF: Image comptoir (boissons à emporter) */}
          <Image
            src="/images/takeAway/coworking-cafe-strasbourg-take-away-boissons-a-emporter.webp"
            width={1096}
            height={350}
            alt="Comptoir Take Away boissons à emporter - CoworKing Café Anticafé Strasbourg"
            className="w-100 thumb__img"
            style={{ height: "auto" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1140px"
          />

          <div className="first__para pt__60">
            <SlideUp>
              <h3 className="t__28">
                Plus d'une trentaine de choix de boissons à emporter
              </h3>
            </SlideUp>
            <p>
              Que vous soyez en télétravail à la maison, en balade dans le
              centre-ville ou simplement de passage, vous pouvez aussi profiter
              de tout ce qu'on prépare au comptoir. Plus de 30 boissons à
              emporter vous attendent : cafés classiques ou plus gourmands,
              matcha et chai latte, créations glacées, jus frais, thés parfumés,
              citronnades maison… bref, toute la palette du coffee shop à
              glisser dans votre journée.
            </p>
            <p>
              Notre offre "à emporter" , c'est la solution parfaite pour celles
              et ceux qui aiment nos boissons… mais ont besoin d'avancer
              ailleurs. Vous passez, vous commandez, vous repartez avec votre
              boisson préférée — la même qualité qu'ici, mais en version nomade.
              ✨
            </p>

            {/* PAGE 3 PDF: Carrousel des 5 catégories de boissons - Images uniformes */}
            <div className="d-flex gap-4">
              <Image
                src="/images/takeAway/menu/carte-boissons-coffeeshop-strasbourg-coworking-cafe.webp"
                width={1375}
                height={1238}
                alt="Carte boissons chaudes - CoworKing Café Anticafé Strasbourg"
                className="d-block w-46 rounded-3"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 46vw"
              />

              <Image
                src="/images/takeAway/menu/menu-boissons-coworking-cafe-strasbourg.webp"
                width={1200}
                height={833}
                alt="Menu boissons froides - CoworKing Café Anticafé Strasbourg"
                className="w-52 rounded-3"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 52vw"
              />
            </div>

            <p>
              Seules les boissons "COLD DRINKS" et "HOT DRINKS" sont incluses à
              volonté sur place.
            </p>
          </div>

          {/* PAGE 4 PDF: Encas/Pizzas - Image gauche, Texte droite */}
          <div className="row align-items-center g-4 pt__50">
            <div className="col-lg-6">
              <Image
                src="/images/takeAway/coworking-cafe-strasbourg-epicerie-encas-snacks.webp"
                width={648}
                height={648}
                alt="Épicerie encas sucrés et snacks - CoworKing Café Anticafé Strasbourg"
                className="w-100 rounded"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="col-lg-6">
              <h3 className="t__28">🍪 Encas sucrés</h3>
              <p>
                Envie d'un petit boost ? On propose une sélection d'encas sucrés
                : cookies, mini-cakes, gaufres moelleuses, barres aux fruits,
                madeleines… Les prix varient entre 1,40 € et 2,90 €, et la
                sélection change au fil de la semaine selon les arrivages et les
                envies du moment. Simple, gourmand, efficace.
              </p>
              <p>
                Sur place, ils sont inclus pour les forfaits jour, semaine et
                mois.
              </p>

              <h3 className="t__28 mt-4">🍕 Nos pizzas faites sur place</h3>
              <p>
                Préparées et cuites ici même, nos pizzas individuelles sont
                parfaites pour un déjeuner rapide ou une faim de loup de fin
                d'après-midi. Classiques, généreuses, toujours fraîches : elles
                sont proposées au tarif unique de 8,90 €. Pratique, bon, sans
                chichi — comme on aime.
              </p>
              <p>
                Sur place, elles sont à 6€90 pour les forfaits jour, semaine et
                mois.
              </p>
            </div>
          </div>

          {/* PAGE 5 PDF: Gobelets Billie - Texte gauche, Image droite */}
          <div className="row align-items-center g-4 pt__50">
            <div className="col-lg-6">
              <h3 className="t__28">
                🌱 Notre solution écologique : les gobelets Billie
              </h3>
              <p>
                Pour limiter les déchets, nous proposons les gobelets
                réutilisables Billie. Le principe est simple : vous prenez votre
                boisson dans un gobelet consigné à 1 €, que vous pouvez ensuite
                ramener ou échanger dans n'importe quelle boutique partenaire
                Billie à Strasbourg. Pratique si vous vous déplacez beaucoup en
                ville ! Les couvercles, eux, sont vendus 1 € (ils ne sont pas
                consignés), ce qui vous permet d'en garder un propre sous la
                main et de n'échanger que le gobelet. Une solution green,
                flexible et super facile à adopter. 🌿
              </p>
            </div>
            <div className="col-lg-6">
              <Image
                src="/images/takeAway/coworking-cafe-strasbourg-billie-cup-ecologie-gobelets-reutilisables.webp"
                width={850}
                height={568}
                alt="Gobelets réutilisables Billie écologiques - CoworKing Café Anticafé Strasbourg"
                className="w-100 rounded"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="second__para pt__60">
            <h3 className="t__28">🛒 Notre petite épicerie</h3>
            <p>
              Juste à côté du comptoir, vous trouverez une mini-épicerie pensée
              pour mettre en avant nos partenaires et coups de cœur du moment :
              cafés de torréfacteurs locaux, thés, sirops, chocolats, granolas,
              biscuits artisanaux… L'idée ? Vous permettre de ramener chez vous
              les ingrédients qui font le goût de nos boissons et petites
              douceurs. Un prolongement naturel de notre comptoir, pour savourer
              l'expérience à la maison ou au bureau.
            </p>
            <SlideUp>
              <div className="d-flex gap-3 ">
                <ul className="">
                  <li>des biscuits... </li>
                  <li>notre café en grains </li>

                  <li>notre matcha et autres préparations de boissons</li>
                  <li>des boissons fraîches (eau, maté pétillant...)</li>
                </ul>
              </div>
            </SlideUp>
          </div>
        </div>
      </article>
    </>
  );
};

export default TakeAway;
