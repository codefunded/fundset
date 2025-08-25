import { BaseError } from 'wagmi';
import {
  UserRejectedRequestError,
  SwitchChainError,
  InsufficientFundsError,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  RpcRequestError,
  TransactionRejectedRpcError,
  WaitForTransactionReceiptTimeoutError,
  decodeErrorResult,
} from 'viem';
import { ERROR_CODES } from '.';
import { UserOperationExecutionError } from 'viem/account-abstraction';

import * as AllAbis from '@fundset/contracts/abi';

const ALL_CUSTOM_SOLIDITY_ERRORS = Object.values(AllAbis)
  .flat()
  .filter(f => f.type === 'error');

// TODO: handle all errors
export const decodeMutationError = (error: Error | null) => {
  if (!error) return null;

  // Handle wagmi-specific errors
  if (error instanceof UserRejectedRequestError) {
    return new Error(ERROR_CODES.TX_REJECTED_BY_USER, { cause: error });
  }

  if (error instanceof SwitchChainError) {
    return new Error(ERROR_CODES.FAILED_TO_SWITCH_TO_REQUIRED_NETWORK, { cause: error });
  }

  // Handle viem-specific blockchain errors
  if (error instanceof InsufficientFundsError) {
    return new Error(ERROR_CODES.INSUFFICIENT_FUNDS, { cause: error });
  }

  if (error instanceof UserOperationExecutionError) {
    try {
      // Handle custom solidity errors
      const decoded = decodeErrorResult({
        data: `0x${error.details.split('0x')[1]}`,
        abi: ALL_CUSTOM_SOLIDITY_ERRORS,
      });
      return new Error(decoded.errorName, { cause: error });
    } catch {
      // ignore decode errors
    }

    return new Error(ERROR_CODES.CONTRACT_EXECUTION_FAILED, { cause: error });
  }

  if (error instanceof ContractFunctionExecutionError) {
    return new Error(ERROR_CODES.CONTRACT_EXECUTION_FAILED, { cause: error });
  }

  if (error instanceof ContractFunctionRevertedError) {
    return new Error(ERROR_CODES.CONTRACT_FUNCTION_REVERTED, { cause: error });
  }

  if (error instanceof TransactionRejectedRpcError) {
    return new Error(ERROR_CODES.TX_REJECTED_BY_NETWORK, { cause: error });
  }

  if (error instanceof WaitForTransactionReceiptTimeoutError) {
    return new Error(ERROR_CODES.TRANSACTION_CONFIRMATION_TIMED_OUT, { cause: error });
  }

  if (error instanceof RpcRequestError) {
    return new Error(ERROR_CODES.RPC_REQUEST_FAILED, { cause: error });
  }

  // Handle BaseError (wagmi base class) or generic errors
  if (error instanceof BaseError || error instanceof Error) {
    return new Error(ERROR_CODES.UNKNOWN_ERROR, { cause: error });
  }

  // Handle unknown errors
  return new Error(ERROR_CODES.UNKNOWN_ERROR, { cause: error });
};
