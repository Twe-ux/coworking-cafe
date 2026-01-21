import ProjectsHistory from "../../../components/site/history/projectsHistory";
import PageTitle from "../../../components/site/pageTitle";
import SlideUp from "../../../utils/animations/slideUp";

export default function historyPage() {
  return (
    <>
      <PageTitle title={"Notre histoire"} />
      <article className="service__details py__90">
        <div className="container">
          <img
            src="/images/history/histoire-coworking-strasbourg.webp"
            alt="img"
            className="w-100 thumb__img rounded-3"
          />
          <div className="first__para pt__60">
            <SlideUp>
              <h2 className="t__54">
                Notre histoire : de deux parcours croisés à un lieu vivant au
                cœur de Strasbourg
              </h2>
            </SlideUp>
            <p className="text-black mt__20">
              Tout a commencé autour de 2012, quelque part entre Aix-en-Provence
              et Marseille 🌞. <br />
              Deux parcours qui se croisent : Christèle, manageuse passionnée et
              déjà pleine d’idées entrepreneuriales, et Thierry, directeur des
              opérations chez Domino’s Pizza, Alsacien d’origine. Deux
              personnalités complémentaires, un duo dans la vie comme au travail
              — et déjà cette envie commune de construire quelque chose
              ensemble.
            </p>
            <h3 className="t__28 mt__20">
              2015 : une famille naissante, un rêve qui s’affine
            </h3>
            <p className="text-black mt__20">
              Lorsqu’ils décident de fonder une famille, une évidence s’impose :
              Christèle déborde de projets… mais n’a jamais d’endroit où
              s’installer pour travailler. Pas de lieu chaleureux, pas d’espace
              créatif, pas de refuge pour brainstormer sereinement. Alors l’idée
              mûrit : “Et si on créait le café que nous aurions nous-mêmes aimé
              trouver ? Un lieu où l’on peut venir travailler sans se sentir de
              trop, sans se presser, en étant accueilli.” En parallèle, l'envie
              de quitter le sud se fait sentir. Strasbourg apparaît comme une
              évidence : une ville vivante, humaine, et surtout le berceau
              familial de Thierry.
            </p>
            <h3 className="t__28 mt__20">2016–2017 : le grand saut</h3>
            <p className="text-black mt__20">
              Dans leurs recherches, ils tombent sur un concept encore rare :
              Anticafé, pionnier du café au temps en France. Une franchise
              recherche justement des franchisés à Strasbourg. Timing parfait.
              Vibration parfaite. Go. Ils déménagent en 2016, montent le projet
              en 2017 et, après des mois de travaux, d’excitation, de doutes,
              d’élans et de nuits blanches…
            </p>
            <p className="text-black mt__20">
              📅 Le 18 décembre 2017, Anticafé Strasbourg ouvre enfin ses
              portes.
            </p>
            <h3 className="t__28 mt__20">
              2018–2019 : deux années lumineuses ✨
            </h3>
            <p className="text-black mt__20">
              Les débuts sont au-delà de leurs espérances. Le lieu trouve
              immédiatement son public : étudiants, indépendants, équipes,
              voyageurs… Tous reconnaissent ce qu’ils ont voulu créer : un
              espace chaleureux, accessible, fluide, où l’on peut vraiment se
              poser pour travailler.
            </p>
            <h3 className="t__28 mt__20">2020–2022 : la tempête du Covid</h3>
            <p className="text-black mt__20">
              Et puis… le monde s’arrête. Fermetures administratives,
              restrictions, passages à vide, reprise timide, incertitudes
              constantes. Pendant près de deux ans et demi, ils tiennent bon.
              Beaucoup de sacrifices, beaucoup de résilience. Beaucoup de fois
              où ils auraient pu (logiquement) abandonner. Mais jamais l’envie
              de continuer n’a disparu. Car ce lieu n’était pas juste un
              commerce : c’était leur projet de vie, leur énergie, leur ancrage
              dans Strasbourg.
            </p>
            <h3 className="t__28 mt__20">2023 : un nouveau souffle</h3>
            <p className="text-black mt__20">
              L’activité reprend, les clients reviennent, les nouveaux affluent.
              Le lieu retrouve son essence : un café-coworking vivant, ancré
              localement, profondément humain. Et une transformation naturelle
              s’opère : même s’ils restent “CoworKing Café by Anticafé”, ils
              deviennent plus indépendants, plus adaptés à la vie locale, plus
              libres d’évoluer à leur rythme.
            </p>
          </div>
          <div className="second__para pt__60">
            <h4 className="t__28">
              Aujourd’hui : un espace pour toutes les manières de travailler
            </h4>

            <div className="row align-items-center mt__40">
              <SlideUp className="col-md-6">
                <img
                  src="/images/history/histoire-anticafe-strasbourg.webp"
                  alt="img"
                  className="w-100 rounded-3"
                />
              </SlideUp>

              <SlideUp className="col-md-5 mt-4 mt-md-0">
                <div>
                  <p className="text-black">Le lieu accueille chaque jour :</p>
                  <ul className="text-black mt__20 d-flex flex-column gap-3">
                    <li>✨ des freelances en quête d’un refuge productif</li>

                    <li>
                      ✨ des étudiants en mode révisions ou projets de groupe
                    </li>
                    <li>
                      ✨ des télétravailleurs qui fuient le canapé pour
                      retrouver de l’énergie
                    </li>
                    <li>
                      ✨ des équipes pour des réunions, formations ou journées
                      off-site
                    </li>
                    <li>
                      ✨ des voyageurs qui cherchent un endroit fiable, calme et
                      chaleureux pour travailler entre deux trains
                    </li>
                  </ul>
                </div>
              </SlideUp>
              <p className="text-black mt__20">
                Six jours sur sept, depuis bientôt dix ans, Christèle et Thierry
                veillent au grain, accueillent, préparent, réparent,
                conseillent, sourient. Ils n’ont jamais cessé d’y croire. Et ça
                se voit. Ça se ressent. Ça se vit.
              </p>
            </div>
          </div>
        </div>
        <ProjectsHistory />
      </article>
    </>
  );
}
