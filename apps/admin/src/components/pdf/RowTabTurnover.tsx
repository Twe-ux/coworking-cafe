import { CellTurnover } from "./CellTurnover";

interface RowTabTurnoverProps {
  firstCell: string | number;
  secCell: string | number;
  thirdCell?: string | number;
  fourthCell?: string | number;
  fifthCell?: string | number | null;
  sixthCell?: string | number | null;
  seventhCell?: string | number;
  eighthCell?: string | number;
}

export function RowTabTurnover({
  firstCell,
  secCell,
  thirdCell,
  fourthCell,
  fifthCell,
  sixthCell,
  seventhCell,
  eighthCell,
}: RowTabTurnoverProps) {
  return (
    <>
      <CellTurnover value={firstCell} place="first" />
      <CellTurnover value={secCell} place="other" />
      {thirdCell !== undefined && thirdCell !== null && <CellTurnover value={thirdCell} place="other" />}
      {fourthCell !== undefined && fourthCell !== null && <CellTurnover value={fourthCell} place="other" />}
      {fifthCell !== undefined && fifthCell !== null && <CellTurnover value={fifthCell} place="other" />}
      {sixthCell !== undefined && sixthCell !== null && <CellTurnover value={sixthCell} place="other" />}
      {seventhCell !== undefined && seventhCell !== null && <CellTurnover value={seventhCell} place="other" />}
      {eighthCell !== undefined && eighthCell !== null && <CellTurnover value={eighthCell} place="other" />}
    </>
  );
}
