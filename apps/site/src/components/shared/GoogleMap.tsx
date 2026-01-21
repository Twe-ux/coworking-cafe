/**
 * GoogleMap Component - apps/site
 * Carte Google Maps pour afficher l'emplacement du CoworKing Café
 */

export function GoogleMap() {
  return (
    <div className="google-map py__130">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d7.7520!3d48.5831!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4796c84d5e7e3f47%3A0x1234567890abcdef!2s1%20Rue%20de%20la%20Division%20Leclerc%2C%2067000%20Strasbourg%2C%20France!5e0!3m2!1sfr!2sfr!4v1234567890123!5m2!1sfr!2sfr"
        width="100%"
        height="450"
        style={{ border: 0, borderRadius: 10 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="CoworKing Café by Anticafé - 1 rue de la Division Leclerc, 67000 Strasbourg"
      />
    </div>
  );
}
