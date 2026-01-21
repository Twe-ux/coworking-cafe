import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Notre Manifeste | CoworKing Café Strasbourg',
  description:
    'Découvrez notre manifeste : un espace pensé pour les travailleurs nomades, les esprits créatifs, où le lien social reprend sa place. Le café motive. L\'humain relie. Vous faites le reste.',
  keywords: [
    'manifeste coworking',
    'valeurs coworking café',
    'philosophie anticafé',
    'travail humain',
    'communauté coworking',
  ],
  openGraph: {
    title: 'Notre Manifeste | CoworKing Café Strasbourg',
    description:
      'Un lieu vivant où l\'on travaille autrement. Le café motive. L\'humain relie. Vous faites le reste.',
    url: 'https://coworkingcafe.fr/manifest',
    siteName: 'CoworKing Café',
    images: [
      {
        url: '/images/manifest/manifeste-coworking-anticafe-strasbourg.webp',
        width: 1200,
        height: 630,
        alt: 'Notre Manifeste - CoworKing Café Strasbourg',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://coworkingcafe.fr/manifest',
  },
};

export default function ManifestPage() {
  return (
    <main className="page-manifest">
      <section className="page-manifest__hero">
        <div className="container">
          <h1 className="page-manifest__title">Notre Manifeste</h1>

          <div className="page-manifest__mantra">
            <h2 className="page-manifest__mantra-text">Le café motive.</h2>
            <h2 className="page-manifest__mantra-text">L&apos;humain relie.</h2>
            <h2 className="page-manifest__mantra-text">Vous faites le reste.</h2>
          </div>
        </div>
      </section>

      <section className="page-manifest__content">
        <div className="container">
          <div className="page-manifest__card">
            <div className="page-manifest__card-text">
              <h3 className="page-manifest__card-title">Notre Manifeste</h3>

              <div className="page-manifest__card-description">
                <p>
                  Ici, on ne vient pas seulement boire un café ou trouver une table où poser son
                  ordinateur.
                </p>
                <p>
                  On vient chercher un lieu qui fait du bien ✨ — où l&apos;on avance, où l&apos;on
                  respire, où l&apos;on se sent enfin à sa place.
                </p>
                <p>
                  Notre raison d&apos;être : offrir un espace pensé pour les travailleurs nomades,
                  les esprits créatifs, les étudiants en quête de focus, les équipes qui veulent se
                  retrouver 🤝 — et toutes celles et ceux qui aiment travailler autrement.
                </p>
                <p>
                  Un lieu vivant, chaleureux, où l&apos;on se sent accueilli sans chichis, et où
                  l&apos;on peut appartenir à une communauté sans jamais devoir jouer un rôle.
                </p>
                <p>Ici, vous n&apos;êtes pas un client de passage :</p>
                <p>
                  vous êtes un visage familier, une idée en mouvement, un projet qui prend forme
                  🚀.
                </p>
                <p>
                  On se croise, on s&apos;inspire, on partage un sourire, un "bon courage", une
                  victoire, une pause — et ça change tout 💛.
                </p>
                <p>
                  Nous croyons profondément que le travail peut être plus humain, plus flexible,
                  plus doux 🌿.
                </p>
                <p>Que les rencontres comptent autant que les deadlines.</p>
                <p>
                  Que la productivité naît parfois d&apos;un bon matcha, d&apos;une chaise
                  confortable, d&apos;un endroit où l&apos;on se sent bien — et souvent d&apos;un
                  regard bienveillant autour de soi.
                </p>
                <p>Notre ambition :</p>
                <p>créer et faire grandir un lieu où le lien social reprend sa place 🤗,</p>
                <p>où l&apos;isolement du télétravail s&apos;allège,</p>
                <p>
                  où l&apos;on peut revenir chaque jour ou une fois par mois en sachant qu&apos;on
                  sera toujours bienvenu.
                </p>
                <p>
                  Nous voulons accompagner les transformations du monde du travail, sans jamais
                  perdre ce qui nous semble essentiel :
                </p>
                <p>
                  la chaleur humaine, le local, l&apos;entraide, la simplicité, le plaisir
                  d&apos;être ensemble ☕🌟.
                </p>
                <p>
                  Nous croyons que l&apos;avenir sera plus collaboratif, plus créatif, plus ancré.
                </p>
                <p>Et qu&apos;il a besoin de lieux comme le nôtre pour exister.</p>
                <p>Bienvenue dans un espace où l&apos;on travaille, mais surtout où l&apos;on vit —</p>
                <p>où chaque moment compte et chaque personne a sa place 💫.</p>
              </div>
            </div>

            <div className="page-manifest__card-image">
              <Image
                src="/images/manifest/manifeste-coworking-anticafe-strasbourg.webp"
                alt="Notre Manifeste - CoworKing Café Strasbourg, un lieu vivant et chaleureux pour travailler autrement"
                width={600}
                height={800}
                quality={90}
                priority
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
