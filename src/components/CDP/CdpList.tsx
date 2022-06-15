import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLayoutContext } from "../Auth/hooks";
import { DebouncedInput } from "../shared/DebouncedInput";
import Grid from "../shared/Grid";
import { CdpServiceResponse, formatNumber, StatusCodes } from "./utils";
import { useCdpService } from "./hooks";
import { CollateralType, IGridColumn, InputsState } from "./types";

const collateralTypes: CollateralType[] = ["ETH-A", "WBTC-A", "USDC-A"];
const cdpColumns: IGridColumn[] = [
  { title: "Id", field: "id" },
  { title: "Type", field: "type" },
  { title: "Collateral", field: "collateral", formater: formatNumber },
  { title: "Debt [DAI]", field: "debt", formater: formatNumber },
  { title: "Address", field: "userAddr" },
];
const handleError = (error: any) => {
  // Some error handling...
  console.error(error);
  toast.error(
    "There was an error while trying to retreive CDPs. Try again with different inputs.",
    { autoClose: 7000 }
  );
};

const CdpList = () => {
  const { setLayoutProgressPercentage, setLayoutProgressVisiblity } =
    useLayoutContext();
  const navigate = useNavigate();
  const { getCdps, abortGetCdpsExecution } = useCdpService();

  const [cdps, setCdps] = useState<any[]>([]);
  const [inputs, setInputs] = useState<InputsState>({
    type: "ETH-A",
    cdpId: "",
  });
  const [validation, setValidation] = useState({
    idIsInvalid: false,
    typeIsInvalid: false,
    message: "",
  });

  const validateInputId = (id: string) => {
    const parsedId = Number(id);
    const idIsInvalid = !Number.isInteger(parsedId) || parsedId <= 0;
    setValidation((p) => ({
      ...p,
      typeIsInvalid: idIsInvalid ? false : p.typeIsInvalid,
      idIsInvalid,
      message: idIsInvalid ? "Id must be a valid positive number." : "",
    }));
    return !idIsInvalid;
  };

  const handleServiceResponse = (response: CdpServiceResponse<any[]>) => {
    if (response.isSuccess) {
      setCdps(response.data);
      setLayoutProgressVisiblity(false);
    } else if (response.code === StatusCodes.AbortedDueMaxOffset) {
      setValidation({
        idIsInvalid: true,
        typeIsInvalid: true,
        message:
          "There are no positions which are close enough to provided id. Please try with different id or type, since search could take a while and pontentially could be timed-out.",
      });
      setCdps([]);
      setLayoutProgressVisiblity(false);
    } else if (response.code === StatusCodes.Exception) {
      setLayoutProgressVisiblity(false);
      handleError(response.error);
    }
  };

  const prepareSearch = () => {
    // Do some initial sets and resets
    setValidation({
      idIsInvalid: false,
      typeIsInvalid: false,
      message: "",
    });
    setLayoutProgressPercentage(2); // Set initial 2 percentage so user can clearly see that loading started
    setLayoutProgressVisiblity(true);
  };

  const updateCollateralType = async (
    ev: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setInputs((p) => ({
      ...p,
      type: ev.target.value as CollateralType,
    }));

    if (inputs.cdpId) {
      // Validate only if there is something entered in input
      const idIsValid = validateInputId(inputs.cdpId);
      if (idIsValid) {
        prepareSearch();
        const response = await getCdps(
          {
            id: Number(inputs.cdpId),
            type: ev.target.value as CollateralType,
          },
          setLayoutProgressPercentage
        );
        handleServiceResponse(response);
      }
    }
  };

  const updateCdpId = async (id: string) => {
    setInputs((p) => ({
      ...p,
      cdpId: id,
    }));

    if (id) {
      const isValid = validateInputId(id);
      if (isValid) {
        prepareSearch();
        const response = await getCdps(
          { id: Number(id), type: inputs.type },
          setLayoutProgressPercentage
        );
        handleServiceResponse(response);
      }
    } else {
      abortGetCdpsExecution();
      setValidation({
        idIsInvalid: false,
        typeIsInvalid: false,
        message: "",
      });
      setLayoutProgressVisiblity(false);
      setCdps([]);
    }
  };

  const goToCdpPage = (cdp: any) => navigate(`/cdp/${cdp.id}`);

  return (
    <div>
      <Row className="mb-3">
        <Col lg="2" md="3">
          <Form.Group>
            <Form.Label className="fw-bolder">COLLATERAL TYPE</Form.Label>
            <Form.Select
              value={inputs.type}
              onChange={updateCollateralType}
              isInvalid={validation.typeIsInvalid}
            >
              {collateralTypes.map((ct) => (
                <option key={`${ct}-opt`}>{ct}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col lg="2" md="3">
          <Form.Group>
            <Form.Label className="fw-bolder">ROUGH CDP ID</Form.Label>
            <DebouncedInput
              className="col-5"
              placeholder="Enter CDP Id.."
              onChange={updateCdpId}
              isInvalid={validation.idIsInvalid}
            />
          </Form.Group>
        </Col>
        {validation.message && (
          <Col lg="8" md="6" className="align-self-end">
            <p className="mb-0 text-danger fw-bold text-break small">
              {validation.message}
            </p>
          </Col>
        )}
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
