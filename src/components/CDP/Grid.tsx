import { Table } from "react-bootstrap";
import { IGridProps } from "./types";

const Grid = ({
  columns,
  data,
  noDataMessage = "No records available.",
}: IGridProps) => (
  <div>
    <Table bordered size="sm" className="text-inherit mb-0">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.title}>{c.title}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((d, ind) => (
          <tr key={`tr_${ind}`}>
            {columns.map((c, ind) => (
              <td key={`td_${ind}`}>{d[c.field]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
    {data.length === 0 && (
      <div className="py-3 text-center border border-light">
        <p className="py-5">{noDataMessage}</p>
      </div>
    )}
  </div>
);

export default Grid;
