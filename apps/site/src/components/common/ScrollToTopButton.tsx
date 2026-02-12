"use client";

export default function ScrollToTopButton() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className="btn btn-primary rounded-circle position-fixed bottom-0 end-0 m-4"
      style={{
        width: "50px",
        height: "50px",
        backgroundColor: "#417972",
        borderColor: "#417972",
      }}
      aria-label="Retour en haut"
    >
      ↑
    </button>
  );
}
