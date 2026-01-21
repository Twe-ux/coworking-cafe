import Menu from "../../../components/site/menu/menu";
import PageTitle from "../../../components/site/pageTitle";

const FoodPage = () => {
  return (
    <>
      <PageTitle title={"Nos Produits Alimentaires"} />
      <Menu
        type="food"
        title="Nos Produits Alimentaires"
        subtitle="Découvrez notre sélection de produits alimentaires, disponibles à la carte."
      />
    </>
  );
};

export default FoodPage;
