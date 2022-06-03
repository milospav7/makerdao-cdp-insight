import { Table } from "react-bootstrap";
import { IGridProps } from "./types";

const Grid = ({
  columns,
  data,
  noDataMessage = "No records available.",
}: IGridProps) => (
  <div>
    <Table
      bordered
      size="md"
      className="table table-striped table-dark table-hover mb-0"
    >
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.title}>{c.title.toUpperCase()}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((d, ind) => (
          <tr key={`tr_${ind}`}>
            {columns.map((c, ind) => (
              <td width={1} key={`td_${ind}`}>
                {d[c.field]}
              </td>
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
