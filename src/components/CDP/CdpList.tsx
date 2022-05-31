import { useState } from "react";
import { Col, Form, Row, Table } from "react-bootstrap";

type CollateralType = "ETH" | "WBTC" | "USDC";
interface InputsState {
  type: CollateralType;
  cdpId: string;
}
const collateralTypes: CollateralType[] = ["ETH", "WBTC", "USDC"];

const CdpList = () => {
  const [cdps, setCdps] = useState([]);
  const [inputs, setInputs] = useState<InputsState>({
    type: "ETH",
    cdpId: "",
  });

  const updateCollateralType = (ev: React.ChangeEvent<HTMLSelectElement>) =>
    setInputs((p) => ({
      ...p,
      type: ev.target.value as CollateralType,
    }));

  const updateCdpId = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setInputs((p) => ({
      ...p,
      cdpId: ev.target.value as CollateralType,
    }));

  return (
    <div>
      <Row className="mb-3">
        <Col lg="2">
          <Form.Group>
            <Form.Label>Collateral type</Form.Label>
            <Form.Select value={inputs.type} onChange={updateCollateralType}>
              {collateralTypes.map((ct) => (
                <option key={`${ct}-opt`}>{ct}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col lg="4">
          <Form.Group>
            <Form.Label>CDP Id</Form.Label>
            <Form.Control
              className="col-5"
              type="text"
              placeholder="Enter CDP Id.."
              value={inputs.cdpId}
              onChange={updateCdpId}
            />
          </Form.Group>
        </Col>
      </Row>
      <Table bordered hover size="sm" className="text-light">
        <thead>
          <tr>
            <th>Id</th>
            <th>Coll. Ration</th>
            <th>Liq. Ration</th>
            <th>Max Coll.</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default CdpList;
