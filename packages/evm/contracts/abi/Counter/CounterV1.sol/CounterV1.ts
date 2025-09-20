export default [
  {
    "type": "event",
    "anonymous": false,
    "name": "Increment",
    "inputs": [
      {
        "type": "uint256",
        "name": "newValue",
        "indexed": false
      }
    ]
  },
  {
    "type": "function",
    "name": "inc",
    "constant": false,
    "payable": false,
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "x",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "uint256"
      }
    ]
  }
] as const;