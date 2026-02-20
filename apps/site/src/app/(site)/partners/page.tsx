import PageTitle from "@/components/site/PageTitle";
import SlideUp from "@/utils/animations/slideUp";
import Image from "next/image";

const Partners = () => {
  return (
    <>
      <PageTitle title={"Partenaires"} />
      <article className="concept pb__130 ">
        <div className="container pb-md-5 mb-md-5">
          <div className="first__para pt__60">
            <SlideUp>
              <h3 className="t__28">
                Découvrez les partenaires de Coworking Café by Anticafé à
                Strasbourg :
              </h3>
            </SlideUp>
            <p>
              Chez Coworking Café by Anticafé, nous croyons aux projets qui se
              construisent ensemble. Derrière chaque boisson, chaque encas,
              chaque service proposé dans notre espace, il y a des partenaires
              de confiance : artisans, fournisseurs, prestataires et acteurs
              locaux avec qui nous partageons des valeurs communes.
            </p>
            <p>
              Travailler, se rencontrer et créer du lien passe aussi par le
              choix de collaborations humaines, responsables et durables. Cette
              page met en lumière celles et ceux qui contribuent, au quotidien,
              à faire vivre notre coworking café à Strasbourg.
            </p>
            <p>
              Être un coworking café, ce n’est pas seulement proposer un espace
              pour travailler. C’est aussi faire des choix conscients :
              privilégier le local quand c’est possible, soutenir des
              initiatives engagées, valoriser le savoir-faire et s’entourer de
              partenaires qui partagent notre vision du travail, de l’accueil et
              du vivre-ensemble.
            </p>
            <p>
              Ces collaborations participent pleinement à l’expérience que nous
              proposons : une atmosphère chaleureuse, authentique, et
              profondément ancrée dans la vie strasbourgeoise.
            </p>

            <h3 className="t__28 mt-4">Un lieu ouvert aux collaborations</h3>
            <p>
              Coworking Café est un lieu de passage, de rencontres et de
              projets. Les partenariats évoluent, se transforment et
              s’enrichissent au fil du temps. Nous aimons tester, co-créer,
              imaginer de nouvelles synergies et donner de la visibilité aux
              initiatives qui nous inspirent.
            </p>

            <p>
              <i>
                👉 Vous êtes une marque, un artisan, une entreprise ou un acteur
                local et souhaitez collaborer avec nous ?
              </i>
            </p>
            <p>
              📩 Contactez-nous par email — chaque demande est étudiée avec
              attention.
            </p>
          </div>

          {/* PAGE Image gauche, Texte droite  OMNINO*/}
          <div className="row align-items-center g-4 pt__50">
            <h2 className="t__28 mb-4">Nos fournisseurs</h2>
            <div className="col-lg-6">
              <Image
                src="/images/partners/omnino-cafe-coworking-strasbourg-anticafe.webp"
                width={648}
                height={648}
                alt="Épicerie encas sucrés et snacks - CoworKing Café Anticafé Strasbourg"
                className="w-100 rounded"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="col-lg-6">
              <h3 className="t__28">
                ☕ Omnino <br />
                Torréfacteur local à Strasbourg
              </h3>
              <p>
                Pour le café, nous avons fait le choix d’un partenaire local
                engagé : Omnino, torréfacteur artisanal basé à Strasbourg.
                Derrière chaque tasse servie chez Coworking Café, il y a un
                travail précis de sélection, de torréfaction et de passion pour
                le café de spécialité. Omnino partage notre exigence de qualité,
                mais aussi notre envie de transmission et de convivialité.
                Au-delà de nous fournir le café que vous dégustez au quotidien,
                Omnino fait vivre la culture café au sein même de notre espace
                en organisant régulièrement des ateliers de torréfaction et de
                découverte certains samedis. Des moments ouverts, pédagogiques
                et chaleureux, qui transforment le coworking café en véritable
                lieu d’échange autour du café, du savoir-faire et du plaisir de
                comprendre ce que l’on boit.
              </p>
              <a href="https://www.omnino.fr" target="_blank" rel="noopener">
                Découvrez OMNINO
              </a>
            </div>
          </div>

          {/* PAGE Texte gauche, Image droite  FERME ST ULRICH*/}
          <div className="row align-items-center g-4 pt__50">
            <div className="col-lg-6">
              <h3 className="t__28">
                🥛 La Ferme Saint-Ulrich <br /> Le goût du vrai lait
              </h3>
              <p>
                Pour le lait de vache, nous travaillons avec la Ferme
                Saint-Ulrich, une exploitation située près de Strasbourg,
                reconnue pour la qualité exceptionnelle de sa production. Ici,
                pas de compromis : un lait authentique, riche et gourmand, qui
                fait toute la différence en tasse. C’est simple : une fois qu’on
                y a goûté, difficile de revenir en arrière. Sa texture, son goût
                et sa tenue en boisson chaude subliment nos cafés, cappuccinos
                et latte, et participent pleinement à l’expérience que nous
                voulons offrir chez Coworking Café. Choisir la Ferme
                Saint-Ulrich, c’est soutenir une agriculture locale et engagée,
                tout en garantissant à nos clients un produit sincère, savoureux
                et respectueux du savoir-faire de notre région.
              </p>
              <a
                href="https://www.bienvenue-a-la-ferme.com"
                target="_blank"
                rel="noopener"
              >
                Découvrez la Ferme Saint-Ulrich
              </a>
            </div>
            <div className="col-lg-6">
              <Image
                src="/images/partners/ferme-st-ulrich-coworking-cafe-strasbourg-anticafe.webp"
                width={850}
                height={568}
                alt="Gobelets réutilisables Billie écologiques - CoworKing Café Anticafé Strasbourg"
                className="w-100 rounded"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* PAGE Image gauche, Texte droite CHERICO */}
          <div className="row align-items-center g-4 pt__50">
            <div className="col-lg-6">
              <Image
                src="/images/partners/cherico-anticafe-strasbourg-coworking-chicoree.webp"
                width={648}
                height={648}
                alt="Épicerie encas sucrés et snacks - CoworKing Café Anticafé Strasbourg"
                className="w-100 rounded"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="col-lg-6">
              <h3 className="t__28">
                🌿 CHERICO
                <br />
                L’alternative sans caféine à base de chicorée
              </h3>
              <p>
                Chez CoworKing Café, nous aimons accompagner vos journées de
                travail avec des boissons qui ont du sens. C’est pourquoi nous
                avons choisi CHERICO, une marque qui propose une chicorée 100 %
                biologique comme alternative naturelle au café ☕ sans caféine.
                Fabriquée à partir de racines de chicorée torréfiées, la
                chicorée CHERICO révèle des arômes doux de caramel et de
                noisette, offrant une boisson chaude réconfortante pour tous
                ceux qui veulent réduire leur consommation de caféine tout en
                gardant un rituel savoureux.
              </p>
              <p>
                La chicorée peut se déguster seule, ou bien être associée à
                notre lait de ferme ou à nos laits végétaux pour une pause latte
                tout en douceur — une option idéale en fin d’après-midi ou pour
                celles et ceux qui préfèrent une boisson chaude sans
                stimulation.
              </p>
              <a href="https://www.cherico.fr" target="_blank" rel="noopener">
                Découvrez CHERICO
              </a>
            </div>
          </div>

          {/* PAGE Texte gauche, Image droite  OATLY*/}
          <div className="row align-items-center g-4 pt__50">
            <div className="col-lg-6">
              <h3 className="t__28">
                🌾 OATLY
                <br /> Le lait d’avoine incontournable
              </h3>
              <p>
                Pour accompagner nos cafés, matchas et boissons gourmandes, nous
                avons choisi OATLY comme alternative végétale au lait de vache.
                Fabriqué à base d’avoine, ce lait végétal est reconnu pour sa
                texture onctueuse, son goût équilibré et sa capacité à sublimer
                les boissons chaudes comme froides, sans masquer les arômes du
                café ou du matcha. <br />
                Chez CoworKing Café, le lait d’avoine OATLY s’adresse aussi bien
                aux personnes intolérantes au lactose, qu’aux curieux, aux
                flexitariens ou à celles et ceux qui souhaitent simplement
                varier les plaisirs. Une option végétale devenue incontournable
                dans les coffee shops modernes, et qui s’inscrit pleinement dans
                notre volonté de proposer des alternatives accessibles,
                qualitatives et dans l’air du temps. 🌱☕
              </p>
            </div>
            <div className="col-lg-6">
              <Image
                src="/images/partners/oatly-coworking-cafe-strasbourg-lait-davoine.webp"
                width={850}
                height={568}
                alt="Gobelets réutilisables Billie écologiques - CoworKing Café Anticafé Strasbourg"
                className="w-100 rounded"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* PAGE Image gauche, Texte droite ALPRO*/}
          <div className="row align-items-center g-4 pt__50">
            <div className="col-lg-6">
              <Image
                src="/images/partners/alpro-lait-vegetal-coffee-shop-strasbourg.webp"
                width={648}
                height={648}
                alt="Épicerie encas sucrés et snacks - CoworKing Café Anticafé Strasbourg"
                className="w-100 rounded"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="col-lg-6">
              <h3 className="t__28">
                🥥🌰 ALPRO <br />
                Les alternatives végétales version Barista
              </h3>
              <p>
                Pour nos laits de coco et d’amande, nous avons choisi ALPRO –
                gamme Barista, spécialement conçue pour les coffee shops et les
                boissons professionnelles. Ces versions offrent une meilleure
                texture, une excellente tenue à la chaleur et une mousse idéale
                pour les cappuccinos, latte et boissons gourmandes.
              </p>
              <p>
                Que ce soit la douceur exotique du lait de coco ou les notes
                délicates du lait d’amande, les laits ALPRO Barista s’intègrent
                parfaitement à nos recettes, sans masquer les saveurs du café ou
                du matcha. Une alternative végétale de qualité, pensée pour le
                goût, la régularité et le plaisir en tasse, que ce soit pour
                travailler longtemps… ou juste savourer l’instant ☕✨
              </p>
            </div>
          </div>

          {/* PAGE Texte gauche, Image droite CAVE BAUMANN*/}
          <div className="row align-items-center g-4 pt__50">
            <div className="col-lg-6">
              <h3 className="t__28">
                🍯 Cave Baumann <br /> Le paradis des sirops à Strasbourg
              </h3>
              <p>
                Pour tous nos sirops Monin, nous faisons confiance à la Cave
                Baumann, une adresse incontournable à Strasbourg pour les
                professionnels comme pour les particuliers. Leur force ? Un
                rayon exceptionnellement fourni, avec un choix impressionnant de
                références, et surtout des prix imbattables.
              </p>
              <p>
                C’est grâce à ce partenariat local que nous pouvons proposer une
                large palette de saveurs dans nos boissons : classiques,
                originales ou saisonnières. En travaillant avec la Cave Baumann,
                nous soutenons un acteur strasbourgeois reconnu, tout en
                garantissant à nos clients des produits de qualité, toujours
                disponibles et au meilleur rapport qualité-prix. Une vraie
                caverne d’Ali Baba pour les amateurs de boissons gourmandes… et
                les baristas exigeants 😉☕
              </p>
            </div>
            <div className="col-lg-6">
              <Image
                src="/images/partners/cave-baumann-strasbourg-cafe-coworking.webp"
                width={850}
                height={568}
                alt="Gobelets réutilisables Billie écologiques - CoworKing Café Anticafé Strasbourg"
                className="w-100 rounded"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* PAGE Image gauche, Texte droite HOLA MATE*/}
          <div className="row align-items-center g-4 pt__50">
            <div className="col-lg-6">
              <Image
                src="/images/partners/hola-mate-onda-strasbourg.jpg"
                width={648}
                height={648}
                alt="Épicerie encas sucrés et snacks - CoworKing Café Anticafé Strasbourg"
                className="w-100 rounded"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="col-lg-6">
              <h3 className="t__28">
                🧉 Hola Maté <br />
                Le maté version locale et engagée
              </h3>
              <p>
                À deux pas de chez nous se trouve Hola Maté, une boutique
                strasbourgeoise spécialisée dans le maté et véritable référence
                pour les amateurs de cette boisson naturelle et énergisante. En
                plus de partager leur passion du maté, ils ont créé leur propre
                marque de boissons : Onda Maté, une gamme fraîche, pétillante et
                pleine de bonnes vibes.
              </p>
              <p>
                Chez Coworking Café, vous pouvez retrouver les boissons Onda
                Maté, imaginées par Hola Maté, parfaites pour faire le plein
                d’énergie autrement qu’avec un café. Ce partenariat de voisinage
                incarne exactement ce que l’on aime : des projets locaux,
                engagés, et pensés pour le quotidien des travailleurs nomades et
                des esprits curieux. Une alternative naturelle, stylée et
                rafraîchissante à découvrir chez nous 🧉✨
              </p>
            </div>
          </div>

          {/* PAGE Texte gauche, Image droite MAGIC LAB */}
          <div className="row align-items-center g-4 pt__50">
            <div className="col-lg-6">
              <h3 className="t__28">
                🍄 Magic Lab <br /> Les champignons adaptogènes, version plaisir
              </h3>
              <p>
                Les boissons à base de champignons adaptogènes se multiplient
                sur le marché… mais chez Coworking Café, nous avons fait le
                choix de Magic Lab. Pourquoi eux ? Pour la qualité des
                ingrédients, l’équilibre des formules, la présence de
                prébiotiques, et surtout pour le goût — parce qu’une boisson
                alternative doit rester un vrai moment de plaisir.
              </p>
              <p>
                Magic Lab propose une approche moderne et accessible des
                champignons fonctionnels, idéale pour celles et ceux qui
                cherchent une alternative au café, plus douce, plus équilibrée
                et tournée vers le bien-être. Nous proposons leurs boissons à
                consommer sur place, mais aussi à la vente dans notre petite
                épicerie, afin que vous puissiez prolonger l’expérience chez
                vous. Une alternative consciente, sélectionnée avec exigence… et
                curiosité 🍄☕
              </p>
            </div>
            <div className="col-lg-6">
              <Image
                src="/images/partners/magiclab-boisson-champignons-coffeeshop-strasbourg.webp"
                width={850}
                height={568}
                alt="Gobelets réutilisables Billie écologiques - CoworKing Café Anticafé Strasbourg"
                className="w-100 rounded"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* PAGE Image gauche, Texte droite LE CAFE POTAGER */}
          <div className="row align-items-center g-4 pt__50">
            <div className="col-lg-6">
              <Image
                src="/images/partners/cafe-potager-strasbourg-partenaire-coworking-anticafe.jpg"
                width={648}
                height={648}
                alt="Épicerie encas sucrés et snacks - CoworKing Café Anticafé Strasbourg"
                className="w-100 rounded"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="col-lg-6">
              <h3 className="t__28">
                🥗 Le Café Potager <br />
                Des déjeuners frais pour vos réunions
              </h3>
              <p>
                Pour les déjeuners lors de nos réunions, formations et
                événements professionnels, nous collaborons avec Le Café
                Potager, un coffee shop – fast good engagé à Strasbourg. Leur
                cuisine fraîche, équilibrée et gourmande s’intègre parfaitement
                à l’esprit de Coworking Café : bien manger, sans lourdeur, même
                lors d’une journée de travail intense.
              </p>
              <p>
                Le Café Potager nous livre des menus pensés pour les groupes,
                idéals pour les temps de pause déjeuner en réunion ou en
                séminaire. Un partenariat local qui nous permet de proposer une
                restauration qualitative, pratique et savoureuse, tout en
                soutenant des acteurs strasbourgeois partageant les mêmes
                valeurs de simplicité, de fraîcheur et d’efficacité 🍽️✨
              </p>
            </div>
          </div>
        </div>

        <div className="pb__130">
          <h3 className="t__28">🤝 Vous êtes une marque ou un fournisseur ?</h3>
          <p>
            Chez Coworking Café, nous aimons découvrir de nouveaux produits et
            mettre en avant des marques dont les valeurs, la qualité et
            l’univers résonnent avec les nôtres. Si vous êtes producteur,
            fournisseur ou marque et que vous souhaitez nous faire découvrir vos
            produits (boissons, food, alternatives, concepts innovants…), nous
            vous invitons à nous contacter par email. Chaque proposition est
            étudiée avec attention, au cas par cas, afin de garantir une
            cohérence avec notre concept, nos usages et l’expérience que nous
            souhaitons offrir à nos clients.
          </p>
        </div>
        <div>
          <h2>Nos partenaires du quotidien</h2>

          {/* PAGE Texte gauche, Image droite GOLDEN TREE*/}
          <div className="row align-items-center g-4 pt__50">
            <div className="col-lg-6">
              <h3 className="t__28">
                🏡 Golden Tree <br /> La conciergerie alsacienne de confiance
              </h3>
              <p>
                Golden Tree est une conciergerie basée en Alsace, spécialisée
                dans la gestion de logements et l’accueil des voyageurs. Un
                partenaire naturel pour Coworking Café, puisque nous partageons
                une même vision : proposer des lieux et des services pensés pour
                le confort, la flexibilité et le quotidien de celles et ceux qui
                bougent, travaillent ou séjournent dans la région.
              </p>
              <p>
                Grâce à ce partenariat, nous créons des ponts entre hébergement,
                travail et art de vivre à Strasbourg, en orientant notamment les
                voyageurs et professionnels de passage vers un lieu où ils
                peuvent s’installer, travailler efficacement et profiter d’un
                vrai coffee shop local.
              </p>
            </div>
            <div className="col-lg-6">
              <Image
                src="/images/partners/golden-tree-conciergerie-partenaires-strasbourg-coworking.webp"
                width={850}
                height={568}
                alt="Gobelets réutilisables Billie écologiques - CoworKing Café Anticafé Strasbourg"
                className="w-100 rounded"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* PAGE Image gauche, Texte droite DRAMAGISTE*/}
          <div className="row align-items-center g-4 pt__50">
            <div className="col-lg-6">
              <Image
                src="/images/partners/le-dramagiste-evenement-entreprise-magicien-strasbourg-partenaires.jpeg"
                width={648}
                height={648}
                alt="Épicerie encas sucrés et snacks - CoworKing Café Anticafé Strasbourg"
                className="w-100 rounded"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="col-lg-6">
              <h3 className="t__28">
                🎩 Le Dramagiste <br />
                Quand le spectacle rencontre l’entreprise
              </h3>
              <p>
                Le Dramagiste, alias Quentin, est magicien, artiste et
                performeur, mais aussi prestataire pour les entreprises. Il
                intervient lors d’événements professionnels, de soirées, de team
                buildings ou de formats hybrides mêlant spectacle, interaction
                et storytelling.
              </p>
              <p>
                Sa capacité à créer des moments marquants et fédérateurs
                s’accorde parfaitement avec l’esprit de Coworking Café,
                notamment lors d’événements, de privatisations ou de formats sur
                mesure. Un partenaire créatif qui apporte une vraie dimension
                humaine et émotionnelle aux projets professionnels.
              </p>
            </div>
          </div>

          {/* PAGE Texte gauche, Image droite NOMADE STATION*/}
          <div className="row align-items-center g-4 pt__50">
            <div className="col-lg-6">
              <h3 className="t__28">
                🧳 Nomade Station <br /> Voyager léger à Strasbourg
              </h3>
              <p>
                Nomade Station est un service de dépôt de bagages situé à
                Strasbourg, pensé pour les voyageurs, les nomades et les
                personnes de passage qui souhaitent profiter de la ville sans
                contrainte. Un partenaire évident pour Coworking Café, puisque
                nous accueillons régulièrement des voyageurs, freelances et
                télétravailleurs en transit.
              </p>
              <p>
                Grâce à ce partenariat, il devient plus simple de poser ses
                valises, s’installer pour travailler, prendre un café ou
                organiser un rendez-vous, le tout sans avoir à gérer ses
                bagages. Une solution pratique et complémentaire qui facilite la
                vie de celles et ceux qui bougent, travaillent autrement et
                veulent profiter pleinement de Strasbourg.
              </p>
            </div>
            <div className="col-lg-6">
              <Image
                src="/images/partners/nomade-station-strasbourg-partenaires-coworking.webp"
                width={850}
                height={568}
                alt="Gobelets réutilisables Billie écologiques - CoworKing Café Anticafé Strasbourg"
                className="w-100 rounded"
                style={{ height: "auto" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="pb__130">
            <h3 className="t__28">🌱 Vous souhaitez collaborer avec nous ?</h3>
            <p>
              Nous sommes également ouverts aux collaborations, projets communs
              et partenariats, qu’ils soient créatifs, événementiels, culturels
              ou professionnels. Ateliers, événements, interventions, contenus
              ou projets hybrides : si vous avez une idée et que vous pensez
              qu’elle pourrait trouver sa place chez Coworking Café,
              écrivez-nous par email. Nous privilégions les échanges simples,
              humains et alignés, avec des partenaires qui partagent notre envie
              de créer des expériences utiles, vivantes et ancrées localement.
            </p>
          </div>
        </div>
      </article>
    </>
  );
};

export default Partners;
