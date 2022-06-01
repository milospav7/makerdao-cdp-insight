import { useState } from "react";
import { Col, Form, Row, Table } from "react-bootstrap";
import { DebouncedInput } from "../shared/DebouncedInput";
import { useCdpService } from "./hooks";
import { CollateralType, InputsState } from "./types";

const collateralTypes: CollateralType[] = ["ETH-A", "WBTC-A", "USDC-A"];

const CdpList = () => {
  const { getCdps } = useCdpService({ onError: (err) => console.log(err) });
  const [cdps, setCdps] = useState<any[]>([]);

  const [inputs, setInputs] = useState<InputsState>({
    type: "ETH-A",
    cdpId: "",
  });

  const updateCollateralType = async (
    ev: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setInputs((p) => ({
      ...p,
      type: ev.target.value as CollateralType,
    }));
    if (inputs.cdpId) {
      const result = await getCdps({
        id: Number(inputs.cdpId),
        type: ev.target.value as CollateralType,
      });
      setCdps(result);
    }
  };

  const updateCdpId = async (id: string | null) => {
    setInputs((p) => ({
      ...p,
      cdpId: id,
    }));
    if (id) {
      const result = await getCdps({ id: Number(id), type: inputs.type });
      setCdps(result);
    }
  };

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
            <DebouncedInput
              className="col-5"
              placeholder="Enter CDP Id.."
              onChange={updateCdpId}
            />
          </Form.Group>
        </Col>
      </Row>
      <Table bordered hover size="sm" className="text-light">
        <thead>
          <tr>
            <th>Id</th>
            <th>Coll. Type</th>
            <th>Coll. Ratio</th>
            <th>Debt</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {cdps.map((cdp) => (
            <tr key={cdp.id}>
              <td>{cdp.id}</td>
              <td>{cdp.type}</td>
              <td>{cdp.collateral}</td>
              <td>{cdp.debt}</td>
              <td>{cdp.userAddr}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CdpList;
