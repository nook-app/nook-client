/* tslint:disable */
/* eslint-disable */
/**
 * Once Upon
 * API documentation
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
import type { AssetTransferDto } from './AssetTransferDto';
import {
    AssetTransferDtoFromJSON,
    AssetTransferDtoFromJSONTyped,
    AssetTransferDtoToJSON,
} from './AssetTransferDto';
import type { NetAssetTransfersDto } from './NetAssetTransfersDto';
import {
    NetAssetTransfersDtoFromJSON,
    NetAssetTransfersDtoFromJSONTyped,
    NetAssetTransfersDtoToJSON,
} from './NetAssetTransfersDto';
import type { ReceiptDto } from './ReceiptDto';
import {
    ReceiptDtoFromJSON,
    ReceiptDtoFromJSONTyped,
    ReceiptDtoToJSON,
} from './ReceiptDto';
import type { SigHashDto } from './SigHashDto';
import {
    SigHashDtoFromJSON,
    SigHashDtoFromJSONTyped,
    SigHashDtoToJSON,
} from './SigHashDto';
import type { TraceDto } from './TraceDto';
import {
    TraceDtoFromJSON,
    TraceDtoFromJSONTyped,
    TraceDtoToJSON,
} from './TraceDto';
import type { TransactionContextTypeDto } from './TransactionContextTypeDto';
import {
    TransactionContextTypeDtoFromJSON,
    TransactionContextTypeDtoFromJSONTyped,
    TransactionContextTypeDtoToJSON,
} from './TransactionContextTypeDto';

/**
 * 
 * @export
 * @interface TransactionDto
 */
export interface TransactionDto {
    /**
     * Block hash
     * @type {string}
     * @memberof TransactionDto
     */
    blockHash: string;
    /**
     * Block number
     * @type {number}
     * @memberof TransactionDto
     */
    blockNumber: number;
    /**
     * Sender address
     * @type {string}
     * @memberof TransactionDto
     */
    from: string;
    /**
     * Gas
     * @type {number}
     * @memberof TransactionDto
     */
    gas: number;
    /**
     * Gas price
     * @type {string}
     * @memberof TransactionDto
     */
    gasPrice: string;
    /**
     * Max fee per gas
     * @type {string}
     * @memberof TransactionDto
     */
    maxFeePerGas: string;
    /**
     * Max priority fee per gas
     * @type {string}
     * @memberof TransactionDto
     */
    maxPriorityFeePerGas: string;
    /**
     * Transaction hash
     * @type {string}
     * @memberof TransactionDto
     */
    hash: string;
    /**
     * Input data
     * @type {string}
     * @memberof TransactionDto
     */
    input: string;
    /**
     * Nonce
     * @type {number}
     * @memberof TransactionDto
     */
    nonce: number;
    /**
     * Receiver address
     * @type {string}
     * @memberof TransactionDto
     */
    to: string;
    /**
     * Transaction index
     * @type {number}
     * @memberof TransactionDto
     */
    transactionIndex: number;
    /**
     * Transaction value
     * @type {string}
     * @memberof TransactionDto
     */
    value: string;
    /**
     * Transaction type
     * @type {number}
     * @memberof TransactionDto
     */
    type: number;
    /**
     * Access list
     * @type {Array<object>}
     * @memberof TransactionDto
     */
    accessList: Array<object>;
    /**
     * Chain ID
     * @type {number}
     * @memberof TransactionDto
     */
    chainId: number;
    /**
     * V value
     * @type {string}
     * @memberof TransactionDto
     */
    v: string;
    /**
     * R value
     * @type {string}
     * @memberof TransactionDto
     */
    r: string;
    /**
     * S value
     * @type {string}
     * @memberof TransactionDto
     */
    s: string;
    /**
     * Timestamp
     * @type {number}
     * @memberof TransactionDto
     */
    timestamp: number;
    /**
     * ISO timestamp
     * @type {string}
     * @memberof TransactionDto
     */
    isoTimestamp: string;
    /**
     * Delegate calls
     * @type {Array<TraceDto>}
     * @memberof TransactionDto
     */
    delegateCalls?: Array<TraceDto>;
    /**
     * Asset transfers
     * @type {Array<AssetTransferDto>}
     * @memberof TransactionDto
     */
    assetTransfers?: Array<AssetTransferDto>;
    /**
     * Signature hash
     * @type {string}
     * @memberof TransactionDto
     */
    sigHash: string;
    /**
     * Internal signature hashes
     * @type {Array<SigHashDto>}
     * @memberof TransactionDto
     */
    internalSigHashes?: Array<SigHashDto>;
    /**
     * Parties involved
     * @type {Array<string>}
     * @memberof TransactionDto
     */
    parties: Array<string>;
    /**
     * Transaction description
     * @type {{ [key: string]: string; }}
     * @memberof TransactionDto
     */
    decode: { [key: string]: string; };
    /**
     * Net asset transfers
     * @type {{ [key: string]: NetAssetTransfersDto; }}
     * @memberof TransactionDto
     */
    netAssetTransfers: { [key: string]: NetAssetTransfersDto; };
    /**
     * Receipt details
     * @type {ReceiptDto}
     * @memberof TransactionDto
     */
    receipt: ReceiptDto;
    /**
     * Transaction context
     * @type {TransactionContextTypeDto}
     * @memberof TransactionDto
     */
    context: TransactionContextTypeDto;
}

/**
 * Check if a given object implements the TransactionDto interface.
 */
export function instanceOfTransactionDto(value: object): boolean {
    if (!('blockHash' in value)) return false;
    if (!('blockNumber' in value)) return false;
    if (!('from' in value)) return false;
    if (!('gas' in value)) return false;
    if (!('gasPrice' in value)) return false;
    if (!('maxFeePerGas' in value)) return false;
    if (!('maxPriorityFeePerGas' in value)) return false;
    if (!('hash' in value)) return false;
    if (!('input' in value)) return false;
    if (!('nonce' in value)) return false;
    if (!('to' in value)) return false;
    if (!('transactionIndex' in value)) return false;
    if (!('value' in value)) return false;
    if (!('type' in value)) return false;
    if (!('accessList' in value)) return false;
    if (!('chainId' in value)) return false;
    if (!('v' in value)) return false;
    if (!('r' in value)) return false;
    if (!('s' in value)) return false;
    if (!('timestamp' in value)) return false;
    if (!('isoTimestamp' in value)) return false;
    if (!('sigHash' in value)) return false;
    if (!('parties' in value)) return false;
    if (!('decode' in value)) return false;
    if (!('netAssetTransfers' in value)) return false;
    if (!('receipt' in value)) return false;
    if (!('context' in value)) return false;
    return true;
}

export function TransactionDtoFromJSON(json: any): TransactionDto {
    return TransactionDtoFromJSONTyped(json, false);
}

export function TransactionDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): TransactionDto {
    if (json == null) {
        return json;
    }
    return {
        
        'blockHash': json['blockHash'],
        'blockNumber': json['blockNumber'],
        'from': json['from'],
        'gas': json['gas'],
        'gasPrice': json['gasPrice'],
        'maxFeePerGas': json['maxFeePerGas'],
        'maxPriorityFeePerGas': json['maxPriorityFeePerGas'],
        'hash': json['hash'],
        'input': json['input'],
        'nonce': json['nonce'],
        'to': json['to'],
        'transactionIndex': json['transactionIndex'],
        'value': json['value'],
        'type': json['type'],
        'accessList': json['accessList'],
        'chainId': json['chainId'],
        'v': json['v'],
        'r': json['r'],
        's': json['s'],
        'timestamp': json['timestamp'],
        'isoTimestamp': json['isoTimestamp'],
        'delegateCalls': json['delegateCalls'] == null ? undefined : ((json['delegateCalls'] as Array<any>).map(TraceDtoFromJSON)),
        'assetTransfers': json['assetTransfers'] == null ? undefined : ((json['assetTransfers'] as Array<any>).map(AssetTransferDtoFromJSON)),
        'sigHash': json['sigHash'],
        'internalSigHashes': json['internalSigHashes'] == null ? undefined : ((json['internalSigHashes'] as Array<any>).map(SigHashDtoFromJSON)),
        'parties': json['parties'],
        'decode': json['decode'],
        'netAssetTransfers': json['netAssetTransfers'],
        'receipt': ReceiptDtoFromJSON(json['receipt']),
        'context': TransactionContextTypeDtoFromJSON(json['context']),
    };
}

export function TransactionDtoToJSON(value?: TransactionDto | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'blockHash': value['blockHash'],
        'blockNumber': value['blockNumber'],
        'from': value['from'],
        'gas': value['gas'],
        'gasPrice': value['gasPrice'],
        'maxFeePerGas': value['maxFeePerGas'],
        'maxPriorityFeePerGas': value['maxPriorityFeePerGas'],
        'hash': value['hash'],
        'input': value['input'],
        'nonce': value['nonce'],
        'to': value['to'],
        'transactionIndex': value['transactionIndex'],
        'value': value['value'],
        'type': value['type'],
        'accessList': value['accessList'],
        'chainId': value['chainId'],
        'v': value['v'],
        'r': value['r'],
        's': value['s'],
        'timestamp': value['timestamp'],
        'isoTimestamp': value['isoTimestamp'],
        'delegateCalls': value['delegateCalls'] == null ? undefined : ((value['delegateCalls'] as Array<any>).map(TraceDtoToJSON)),
        'assetTransfers': value['assetTransfers'] == null ? undefined : ((value['assetTransfers'] as Array<any>).map(AssetTransferDtoToJSON)),
        'sigHash': value['sigHash'],
        'internalSigHashes': value['internalSigHashes'] == null ? undefined : ((value['internalSigHashes'] as Array<any>).map(SigHashDtoToJSON)),
        'parties': value['parties'],
        'decode': value['decode'],
        'netAssetTransfers': value['netAssetTransfers'],
        'receipt': ReceiptDtoToJSON(value['receipt']),
        'context': TransactionContextTypeDtoToJSON(value['context']),
    };
}

