import { useState } from "react";
import { Col, Form, Row, Table } from "react-bootstrap";
import Web3 from "web3";
import { DebouncedInput } from "../shared/DebouncedInput";
import Contract from "../../contracts/VaultInfo/Contract";
import { useAuthContext } from "../Provider/hooks";

type CollateralType = "ETH" | "WBTC" | "USDC";
interface InputsState {
  type: CollateralType;
  cdpId: string | null;
}
const collateralTypes: CollateralType[] = ["ETH", "WBTC", "USDC"];

const resolveCdpsInParallel = async (
  id: number,
  getter: (id: number) => any
) => {
  let retreivedCdps: any[] = [];
  let topNotReached = true;
  let bottomNotReached = true;
  let currentTopId = id;
  let currentBottomId = id - 1;
  const parallelismDegree = 5;

  while (
    retreivedCdps.length < 20 ||
    (retreivedCdps.length < 20 && !topNotReached && !bottomNotReached)
  ) {
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

    bottomIdsResponse.forEach((resp) => {
      if (retreivedCdps.length < 20) retreivedCdps.push(resp);
    });

    topIdsResponse.forEach((resp) => {
      if (retreivedCdps.length < 20) retreivedCdps.push(resp);
    });
  }

  console.log("length", retreivedCdps);
};

const CdpList = () => {
  const [cdps, setCdps] = useState([]);
  const [inputs, setInputs] = useState<InputsState>({
    type: "ETH",
    cdpId: "",
  });
  const {
    wallet: { account },
  } = useAuthContext();

  const getCdps = async (id: number, type: CollateralType) => {
    try {
      const web3 = new Web3(window.ethereum as any);
      const { abi, addres } = Contract;
      const contract = new web3.eth.Contract(abi, addres);
      // const res = await contract.methods.getCdpInfo(id).call({ from: account });
      // console.log(res);
      contract.options.from = account;
      const method = (id: number) => contract.methods.getCdpInfo(id).call();
      resolveCdpsInParallel(id, method);
    } catch (err) {}
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
