export default [
  {
    "type": "error",
    "name": "CounterV2__ZeroIncrement",
    "inputs": []
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "IncrementBy",
    "inputs": [
      {
        "type": "uint256",
        "name": "newValue",
        "indexed": false
      },
      {
        "type": "uint256",
        "name": "by",
        "indexed": false
      }
    ]
  },
  {
    "type": "function",
    "name": "incBy",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "by"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "incByAddress",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "uint256",
        "name": "by"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "xByAddress",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "addr"
      }
    ],
    "outputs": [
      {
        "type": "uint256"
      }
    ]
  }
] as const;