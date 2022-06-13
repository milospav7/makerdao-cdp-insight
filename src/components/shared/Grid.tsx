import React from "react";
import { Table } from "react-bootstrap";
import { IGridProps } from "../CDP/types";

const Grid = ({
  columns,
  data,
  noDataMessage = "No records available.",
  onRowClick,
}: IGridProps) => {
  const clickHandler =
    (rowData: any) => (_ev: React.MouseEvent<HTMLTableRowElement>) =>
      onRowClick(rowData);

  return (
    <div>
      <Table
        size="md"
        className="table mb-0 text-inherit bg-dark-overlay"
        borderless
      >
        <thead className="border-bottom border-light-silver">
          <tr>
            {columns.map((c) => (
              <th key={c.title}>{c.title.toUpperCase()}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d, ind) => (
            <tr
              key={`tr_${ind}`}
              onClick={clickHandler(d)}
              className="row-link"
            >
              {columns.map((c, ind) => (
                <td width={1} key={`td_${ind}`}>
                  {c.formater ? c.formater(d[c.field]) : d[c.field]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      {data.length === 0 && (
        <div className="empty-grid-body d-flex bg-dark-overlay">
          <p className="m-auto">{noDataMessage}</p>
        </div>
      )}
    </div>
  );
};

export default Grid;
