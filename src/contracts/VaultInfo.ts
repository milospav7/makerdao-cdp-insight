
const abi = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "_getProxyOwner",
    outputs: [{ internalType: "address", name: "userAddr", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_cdpId", type: "uint256" }],
    name: "getCdpInfo",
    outputs: [
      { internalType: "address", name: "urn", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "userAddr", type: "address" },
      { internalType: "bytes32", name: "ilk", type: "bytes32" },
      { internalType: "uint256", name: "collateral", type: "uint256" },
      { internalType: "uint256", name: "debt", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const addres = "0x68C61AF097b834c68eA6EA5e46aF6c04E8945B2d";

const Contract = { abi, addres };

export default Contract;
