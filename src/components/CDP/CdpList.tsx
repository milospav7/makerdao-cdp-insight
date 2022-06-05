import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLayoutContext } from "../Auth/hooks";
import { DebouncedInput } from "../shared/DebouncedInput";
import Grid from "../shared/Grid";
import { CdpServiceResponse, StatusCodes } from "../utils";
import { useCdpService } from "./hooks";
import { CollateralType, IGridColumn, InputsState } from "./types";

const collateralTypes: CollateralType[] = ["ETH-A", "WBTC-A", "USDC-A"];
const cdpColumns: IGridColumn[] = [
  { title: "Id", field: "id" },
  { title: "Type", field: "type" },
  { title: "Collateral", field: "collateral" },
  { title: "Debt [DAI]", field: "debt" },
  { title: "Address", field: "userAddr" },
];

const CdpList = () => {
  const { setLayoutProgressPercentage, setLayoutProgressVisiblity } =
    useLayoutContext();
  const navigate = useNavigate();

  const [cdps, setCdps] = useState<any[]>([]);
  const [inputs, setInputs] = useState<InputsState>({
    type: "ETH-A",
    cdpId: "",
  });

  const handleError = (error: any) => {
    // Some error handling...
    console.error(error);
    toast.error(
      "There was an error while trying to retreive CDPs. Try again with different inputs.",
      { autoClose: 7000 }
    );
    setLayoutProgressPercentage(0);
    setLayoutProgressVisiblity(false);
  };

  const { getCdps } = useCdpService();

  const handleServiceResponse = (response: CdpServiceResponse<any[]>) => {
    if (response.isSuccess) {
      setCdps(response.data);
      setLayoutProgressVisiblity(false);
    } else if (response.code === StatusCodes.AbortedDueMaxOffset) {
      toast.error(
        "We are not able to quickly resolve list of CDPs because there are no ones which are close enough to provided id. Please try with different id or type, since search could take a while and pontentially could be timed-out.",
        { autoClose: 120000 }
      );
      setCdps([]);
      setLayoutProgressVisiblity(false);
    } else if (response.code === StatusCodes.Exception) {
      handleError(response.error);
    }
  };

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

      const response = await getCdps(
        {
          id: Number(inputs.cdpId),
          type: ev.target.value as CollateralType,
        },
        setLayoutProgressPercentage
      );

      handleServiceResponse(response);
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

      const response = await getCdps(
        { id: Number(id), type: inputs.type },
        setLayoutProgressPercentage
      );

      handleServiceResponse(response);
    } else setCdps([]);
  };

  const goToCdpPage = (cdp: any) => navigate(`/cdp/${cdp.id}`);

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
        columns={cdpColumns}
        data={cdps}
        noDataMessage="No records available. Use filters to search for CDPs.."
        onRowClick={goToCdpPage}
      />
    </div>
  );
};

export default CdpList;
