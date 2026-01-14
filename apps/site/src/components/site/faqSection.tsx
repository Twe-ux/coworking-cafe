import { faqData } from "@/db/faqData";
import SlideUp from "@/utils/animations/slideUp";

const FaqSection = () => {
  return (
    <section className="faq py__130">
      <div className="container">
        <h2 className="title text-center">
          We will be there for you every time of the way 24/7! for customer
        </h2>
        <div className="faq__wapper">
          <div className="accordion" id="accordionExample">
            {faqData.map((item) => (
              <SlideUp
                key={item.id}
                className="accordion-item"
                delay={item.delay}
              >
                <h2 className="accordion-header" id={item.id}>
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${item.id}`}
                    aria-expanded="false"
                    aria-controls={`collapse${item.id}`}
                  >
                    <span>{item.question}</span>
                  </button>
                </h2>
                <div
                  id={`collapse${item.id}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={item.id}
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </SlideUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
