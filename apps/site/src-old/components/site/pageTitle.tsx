interface PageTitleProps {
  title: string;
}

const PageTitle = ({ title }: PageTitleProps) => {
  return (
    <section className="page__header position-relative">
      <div className="container">
        <div className="row">
          <div className="d-flex justify-content-center align-items-center">
            <h2>{title}</h2>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PageTitle;
