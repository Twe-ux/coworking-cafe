import { SpacesDetailsProps } from "../../../db/spaces/spacesData";

interface SpaceCounterProps {
  counterBox: SpacesDetailsProps["counterBox"];
}

const SpaceCounter = ({ counterBox }: SpaceCounterProps) => {
  return (
    <div>
      <div className="counter">
        {counterBox.map((item) => {
          return (
            <div key={item.id} className="counter__box">
              <div className="d-flex ">
                <h1 className="counter__number">{item.number}</h1>
                <sup>{item.stars}</sup>
              </div>

              <p className="counter__text">{item.box}</p>
            </div>
          );
        })}
      </div>
      <p className="p">
        <sup>*</sup> à partir de. Tarifs en TTC.
      </p>
    </div>
  );
};

export default SpaceCounter;
