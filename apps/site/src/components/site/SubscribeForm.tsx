export default function SubscribeForm() {
  return (
    <div className="subscribe">
      <div className="row justify-content-center">
        <div className="d-flex gap-2 flex-column mb-4 align-items-center text-center">
          <h2>Abonne-toi à notre newsletter</h2>
          <p className="mb-0">
            et reçois seulement une fois par mois toutes les actus, événements
            et promotions en cours...
          </p>
        </div>

        <div className="d-flex gap-3 justify-content-center flex-column flex-md-row align-items-stretch">
          <input className="input__btn" type="text" placeholder="Ton Email" />
          <button className="common__btn d-flex align-items-center">
            <span>Inscris toi</span>
            <i className="fa-solid fa-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
