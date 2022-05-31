import { useState } from "react";
import { Col, Form, Row, Table } from "react-bootstrap";
import Web3 from "web3";
import { DebouncedInput } from "../shared/DebouncedInput";
import Contract from "../../contracts/VaultInfo/Contract";
import { bytesToString } from "@defisaver/tokens/esm/utils";

type CollateralType = "ETH-A" | "WBTC-A" | "USDC-A";
interface InputsState {
  type: CollateralType;
  cdpId: string | null;
}
const collateralTypes: CollateralType[] = ["ETH-A", "WBTC-A", "USDC-A"];

const isTargetType = (ilk: string, expectedType: string) => {
  const encoded = bytesToString(ilk);
  return encoded === expectedType;
};

const isExistingCdp = (cdp: any) =>
  cdp.owner !== "0x0000000000000000000000000000000000000000";

const resolveCdpsInParallel = async (
  inputId: number,
  inputType: CollateralType,
  getter: (id: number) => any
) => {
  let retreivedCdps: any[] = [];
  let topNotReached = true;
  let bottomNotReached = true;
  let currentTopId = inputId;
  let currentBottomId = inputId - 1;
  const parallelismDegree = 5;

  while (retreivedCdps.length < 20 && (topNotReached || bottomNotReached)) {
    console.log(topNotReached, bottomNotReached);
    const topIds = [...Array(parallelismDegree).keys()].map(
      (x) => currentTopId + x
    );
    const bottomIds = [...Array(parallelismDegree).keys()].map(
      (x) => currentBottomId - x
    );

    let topIdsResponse = await Promise.all(topIds.map((id) => getter(id)));
    let bottomIdsResponse = await Promise.all(
      bottomIds.map((id) => getter(id))
    );

    const filteredBottomResponse = bottomIdsResponse.filter(
      (cdp) => isExistingCdp(cdp) && isTargetType(cdp.ilk, inputType)
    );
    const filteredTopResponse = topIdsResponse.filter(
      (cdp) => isExistingCdp(cdp) && isTargetType(cdp.ilk, inputType)
    );

    if (filteredBottomResponse.length === 0) bottomNotReached = false;
    else
      filteredBottomResponse.forEach((cdp) => {
        if (retreivedCdps.length < 20) retreivedCdps.push(cdp);
      });

    if (filteredTopResponse.length === 0) topNotReached = false;
    else
      filteredTopResponse.forEach((cdp) => {
        if (retreivedCdps.length < 20) retreivedCdps.push(cdp);
      });
  }

  console.log("length", retreivedCdps);
};

const CdpList = () => {
  const [cdps, setCdps] = useState([]);
  const [inputs, setInputs] = useState<InputsState>({
    type: "ETH-A",
    cdpId: "",
  });

  const getCdps = async (id: number, type: CollateralType) => {
    try {
      const web3 = new Web3(window.ethereum as any);
      // await window.ethereum?.enable(); // Use on cdp page
      const { abi, addres } = Contract;
      const contract = new web3.eth.Contract(abi, addres);
      const method = (id: number) => contract.methods.getCdpInfo(id).call();
      resolveCdpsInParallel(id, type, method);
    } catch (err) {
      console.log("errorr");
    }
  };

  const updateCollateralType = (ev: React.ChangeEvent<HTMLSelectElement>) =>
    setInputs((p) => ({
      ...p,
      type: ev.target.value as CollateralType,
    }));

  const updateCdpId = (id: string | null) => {
    setInputs((p) => ({
      ...p,
      cdpId: id,
    }));
    if (id) getCdps(Number(id), inputs.type);
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
