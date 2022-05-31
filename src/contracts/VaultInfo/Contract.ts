import { AbiItem } from "web3-utils";
import abiJson from "./ERC20Abi.json";

const addres = "0x68C61AF097b834c68eA6EA5e46aF6c04E8945B2d";
const abi = abiJson as AbiItem[];

const Contract = { addres, abi };

export default Contract;
