import ProtectedEmail from "../common/ProtectedEmail";

export default function Helper() {
  return (
    <div className="subscribe">
      <div className="row justify-content-center">
        <div className="d-flex gap-2 flex-column mb-4 align-items-center text-center">
          <h2>Besoin d'aide ?</h2>
          <p className="mb-0">
            Notre équipe est à votre disposition pour vous conseiller
          </p>
        </div>
        <div className="d-flex gap-3 justify-content-center flex-column flex-md-row align-items-stretch">
          <a
            href="tel:+33987334519"
            className="common__btn d-flex align-items-center"
          >
            <i className="bi bi-telephone me-2"></i>
            <span>Appelez-nous</span>
          </a>
          <ProtectedEmail
            user="contact"
            domain="btcafe.com"
            className="common__btn d-flex align-items-center"
            showIcon={true}
            displayText="Écrivez-nous"
          />
        </div>
      </div>
    </div>
  );
}
