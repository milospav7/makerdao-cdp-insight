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

const isNonexistingCdp = (cdp: any) =>
  cdp.owner === "0x0000000000000000000000000000000000000000";

const resolveCdpsInParallel = async (
  inputId: number,
  inputType: CollateralType,
  getter: (id: number) => any
) => {
  const parallelismDegree = 5;
  const expectedListSize = 20;

  let retreivedCdps: any[] = [];
  let topNotReached = true;
  let bottomNotReached = true;
  let currentTopId = inputId;
  let currentBottomId = inputId - 1;

  while (
    retreivedCdps.length < expectedListSize &&
    (topNotReached || bottomNotReached)
  ) {
    if (bottomNotReached) {
      const chunkSizeShouldBeReduced = currentBottomId < parallelismDegree; // Check to prevent hitting through 0 id
      const modifiedDegree = chunkSizeShouldBeReduced
        ? currentBottomId
        : parallelismDegree;

      const bottomIds = [...Array(modifiedDegree).keys()].map(
        // eslint-disable-next-line no-loop-func
        (x) => currentBottomId - x
      );

      let bottomIdsResponse = await Promise.all(
        bottomIds.map((id) => getter(id))
      );

      for (const cdp of bottomIdsResponse) {
        const nonExistingCdp = isNonexistingCdp(cdp);
        const lastBottomIdProcessed = cdp.id === 1;

        if (nonExistingCdp || lastBottomIdProcessed) {
          bottomNotReached = false;
        } else {
          const typeMatch = isTargetType(cdp.ilk, inputType);
          if (typeMatch && retreivedCdps.length < 20) {
            retreivedCdps.push(cdp);
            currentBottomId = cdp.id - 1;
          }
        }
      }
    }

    if (topNotReached) {
      const topIds = [...Array(parallelismDegree).keys()].map(
        // eslint-disable-next-line no-loop-func
        (x) => currentTopId + x
      );

      let topIdsResponse = await Promise.all(topIds.map((id) => getter(id)));

      for (const cdp of topIdsResponse) {
        const nonExistingCdp = isNonexistingCdp(cdp);

        if (nonExistingCdp) {
          topNotReached = false;
        }
        {
          const typeMatch = isTargetType(cdp.ilk, inputType);
          if (typeMatch && retreivedCdps.length < 20) {
            retreivedCdps.push(cdp);
            currentTopId = cdp.id + 1;
          }
        }
      }
    }
  }

  console.log("length", retreivedCdps);
  console.log(currentBottomId, currentTopId);
  return retreivedCdps;
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
      const method = async (id: number) => {
        const result = await contract.methods.getCdpInfo(id).call();
        return { ...result, id };
      };
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
