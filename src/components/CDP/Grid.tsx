import { Table } from "react-bootstrap";
import { IGridProps } from "./types";

const Grid = ({ columns, data }: IGridProps) => (
  <Table bordered hover size="sm" className="text-light">
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
);

export default Grid;
