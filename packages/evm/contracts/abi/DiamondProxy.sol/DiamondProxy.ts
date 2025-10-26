export default [
  {
    "type": "error",
    "name": "DiamondProxyWritable__InvalidInitializationParameters",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DiamondProxyWritable__RemoveTargetNotZeroAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DiamondProxyWritable__ReplaceTargetIsIdentical",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DiamondProxyWritable__SelectorAlreadyAdded",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DiamondProxyWritable__SelectorIsImmutable",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DiamondProxyWritable__SelectorNotFound",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DiamondProxyWritable__SelectorNotSpecified",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DiamondProxyWritable__TargetHasNoCode",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Introspectable__InvalidInterfaceId",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Ownable__NotOwner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Ownable__NotTransitiveOwner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Proxy__ImplementationIsNotContract",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Proxy__SenderIsNotAdmin",
    "inputs": []
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "AdminChanged",
    "inputs": [
      {
        "type": "address",
        "name": "previousAdmin",
        "indexed": false
      },
      {
        "type": "address",
        "name": "newAdmin",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "BeaconUpgraded",
    "inputs": [
      {
        "type": "address",
        "name": "beacon",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "DiamondCut",
    "inputs": [
      {
        "type": "tuple[]",
        "name": "facetCuts",
        "indexed": false,
        "components": [
          {
            "type": "address",
            "name": "target"
          },
          {
            "type": "uint8",
            "name": "action"
          },
          {
            "type": "bytes4[]",
            "name": "selectors"
          }
        ]
      },
      {
        "type": "address",
        "name": "target",
        "indexed": false
      },
      {
        "type": "bytes",
        "name": "data",
        "indexed": false
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "type": "address",
        "name": "previousOwner",
        "indexed": true
      },
      {
        "type": "address",
        "name": "newOwner",
        "indexed": true
      }
    ]
  },
  {
    "type": "event",
    "anonymous": false,
    "name": "Upgraded",
    "inputs": [
      {
        "type": "address",
        "name": "implementation",
        "indexed": true
      }
    ]
  },
  {
    "type": "function",
    "name": "diamondCut",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "tuple[]",
        "name": "facetCuts",
        "components": [
          {
            "type": "address",
            "name": "target"
          },
          {
            "type": "uint8",
            "name": "action"
          },
          {
            "type": "bytes4[]",
            "name": "selectors"
          }
        ]
      },
      {
        "type": "address",
        "name": "target"
      },
      {
        "type": "bytes",
        "name": "data"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "facetAddress",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes4",
        "name": "selector"
      }
    ],
    "outputs": [
      {
        "type": "address",
        "name": "facet"
      }
    ]
  },
  {
    "type": "function",
    "name": "facetAddresses",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "address[]",
        "name": "addresses"
      }
    ]
  },
  {
    "type": "function",
    "name": "facetFunctionSelectors",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "facet"
      }
    ],
    "outputs": [
      {
        "type": "bytes4[]",
        "name": "selectors"
      }
    ]
  },
  {
    "type": "function",
    "name": "facets",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "tuple[]",
        "name": "diamondFacets",
        "components": [
          {
            "type": "address",
            "name": "target"
          },
          {
            "type": "bytes4[]",
            "name": "selectors"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getFallbackAddress",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [],
    "outputs": [
      {
        "type": "address",
        "name": "fallbackAddress"
      }
    ]
  },
  {
    "type": "function",
    "name": "setFallbackAddress",
    "constant": false,
    "payable": false,
    "inputs": [
      {
        "type": "address",
        "name": "fallbackAddress"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "constant": true,
    "stateMutability": "view",
    "payable": false,
    "inputs": [
      {
        "type": "bytes4",
        "name": "interfaceId"
      }
    ],
    "outputs": [
      {
        "type": "bool"
      }
    ]
  }
] as const;