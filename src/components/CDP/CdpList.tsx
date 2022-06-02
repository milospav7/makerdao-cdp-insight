import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { toast } from "react-toastify";
import { useLayoutContext } from "../Provider/hooks";
import { DebouncedInput } from "../shared/DebouncedInput";
import Grid from "./Grid";
import { useCdpService } from "./hooks";
import { CollateralType, IGridColumn, InputsState } from "./types";

const collateralTypes: CollateralType[] = ["ETH-A", "WBTC-A", "USDC-A"];
const gridColumns: IGridColumn[] = [
  { title: "Id", field: "id" },
  { title: "Coll. Type", field: "type" },
  { title: "Coll. Ratio", field: "collateral" },
  { title: "Debt", field: "debt" },
  { title: "Address", field: "userAddr" },
];

const CdpList = () => {
  const { setLayoutProgressPercentage, setLayoutProgressVisiblity } =
    useLayoutContext();
  const [cdps, setCdps] = useState<any[]>([]);
  const [inputs, setInputs] = useState<InputsState>({
    type: "ETH-A",
    cdpId: "",
  });

  const errorHandler = (error: any) => {
    // Some error handling...
    console.error(error);
    toast.error(
      "There was an error while trying to retreive CDPs. Try again with different inputs.",
      { autoClose: 7000 }
    );
  };

  const { getCdps } = useCdpService({ onError: errorHandler });

  const updateCollateralType = async (
    ev: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setInputs((p) => ({
      ...p,
      type: ev.target.value as CollateralType,
    }));
    if (inputs.cdpId) {
      setLayoutProgressPercentage(0);
      setLayoutProgressVisiblity(true);

      const output = await getCdps(
        {
          id: Number(inputs.cdpId),
          type: ev.target.value as CollateralType,
        },
        setLayoutProgressPercentage
      );

      if (!output.aborted) {
        setCdps(output.result);
        setLayoutProgressVisiblity(false);
      }
    } else setCdps([]);
  };

  const updateCdpId = async (id: string | null) => {
    setInputs((p) => ({
      ...p,
      cdpId: id,
    }));
    if (id) {
      setLayoutProgressPercentage(0);
      setLayoutProgressVisiblity(true);

      const output = await getCdps(
        { id: Number(id), type: inputs.type },
        setLayoutProgressPercentage
      );

      if (!output.aborted) {
        setCdps(output.result);
        setLayoutProgressVisiblity(false);
      }
    } else setCdps([]);
  };

  return (
    <div>
      <Row className="mb-3">
        <Col lg="2" md="3">
          <Form.Group>
            <Form.Label className="fw-bolder">COLLATERAL TYPE</Form.Label>
            <Form.Select value={inputs.type} onChange={updateCollateralType}>
              {collateralTypes.map((ct) => (
                <option key={`${ct}-opt`}>{ct}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col lg="2" md="3">
          <Form.Group>
            <Form.Label className="fw-bolder">CDP ID</Form.Label>
            <DebouncedInput
              className="col-5"
              placeholder="Enter CDP Id.."
              onChange={updateCdpId}
            />
          </Form.Group>
        </Col>
      </Row>
      <Grid
        columns={gridColumns}
        data={cdps}
        noDataMessage="No records available. Use filters to search for CDPs.."
      />
    </div>
  );
};

export default CdpList;
