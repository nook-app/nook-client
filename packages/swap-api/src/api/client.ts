import { createPublicClient, http } from "viem";
import * as chains from "viem/chains";
import { camelToSnakeCase } from "@nook/common/utils";
import { publicActionReverseMirage } from "reverse-mirage";
import { ZeroXSupportedChain } from "@nook/common/types";
import { keccak256, toHex, toRlp } from "viem";

import { getContractAddressesForChainOrThrow } from "@0x/contract-addresses";
export const chainsByName: { [key: string]: chains.Chain } = Object.entries(
  chains,
).reduce(
  (acc: { [key: string]: chains.Chain }, [key, chain]) => {
    acc[key] = chain;
    return acc;
  },
  { ethereum: chains.mainnet }, // Convenience for ethereum, which is 'homestead' otherwise
);

export const chainById: { [key: number]: chains.Chain } = Object.values(
  chains,
).reduce((acc: { [key: number]: chains.Chain }, chain) => {
  acc[chain.id] = chain;
  return acc;
}, {});

export const CHAIN_RPC_URLS: Record<string, string | undefined> = {
  ethereum: process.env.ETHEREUM_RPC_URL,
  polygon: process.env.POLYGON_RPC_URL,
  arbitrum: process.env.ARBITRUM_RPC_URL,
  optimism: process.env.OPTIMISM_RPC_URL,
  base: process.env.BASE_RPC_URL,
};

export function getClient(name: ZeroXSupportedChain) {
  const chain = chainsByName[name];

  if (chain === undefined) {
    throw new Error(`Could not find chain with name ${name}`);
  }

  const chainName = camelToSnakeCase(chain.name);
  const rpcUrl = CHAIN_RPC_URLS[name];

  const client = createPublicClient({
    transport: rpcUrl ? http(rpcUrl) : http(),
    chain,
  })
    // some insane type error stuff that doesn't happen in other repos? idk
    // @ts-ignore
    .extend(publicActionReverseMirage)
    // @ts-ignore
    .extend((client) => ({ chainName, chainId: chain.id }));
  return client;
}

const memo: Record<string, number> = {};

export function getAffiliateFeeTransformerNonce(
  chain: ZeroXSupportedChain,
): number {
  const key = `${chain}`;
  // not sure how expensive keccak is, but cache anyway
  if (memo[key]) {
    return memo[key];
  }
  const chainId = chainsByName[chain].id;
  // get the addresses using chainId
  const addresses = getContractAddressesForChainOrThrow(chainId);
  // transformers are deployed by the deployer
  const transformerDeployerAddress = addresses.exchangeProxyTransformerDeployer;
  // affiliate fee transformer has different addresses on different chains due to different deployer address and different nonce values
  const affiliateFeeTransformerAddress =
    addresses.transformers.affiliateFeeTransformer;
  // just search all nonces. should be less than 10. don't do infinite loop just in case
  for (let i = 0; i < 100; i++) {
    const derivedAddress = deriveDeployAddress(
      i,
      transformerDeployerAddress as `0x${string}`,
    );
    console.log(derivedAddress);
    if (derivedAddress === affiliateFeeTransformerAddress) {
      memo[key] = i;
      return i;
    }
  }
  throw new Error(
    `Could not find nonce for ${affiliateFeeTransformerAddress} on ${chain}`,
  );
}

export function deriveDeployAddress(
  nonce: number,
  address: `0x${string}`,
): `0x${string}` {
  const rlpEncoded = toRlp([address, toHex(nonce)], "bytes");
  const result = keccak256(rlpEncoded);
  return `0x${result.slice(26)}`;
}
