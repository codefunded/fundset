import { deploy } from '../../deploy/produciton.ts';

export const serializeContractDeploymentResult = (result: Awaited<ReturnType<typeof deploy>>) => {
  return Object.entries(result)
    .map(([name, contract]) => {
      console.log(`${name} deployed to: ${contract.contract.address}`);
      return {
        [name]: {
          contract: contract.contract.address,
          abi: contract.contract.abi,
          facets:
            'facets' in contract
              ? Object.entries(contract.facets).map(([facetName, facetValue]) => ({
                  name: facetName,
                  abi: facetValue.abi,
                }))
              : [],
        },
      };
    })
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});
};
