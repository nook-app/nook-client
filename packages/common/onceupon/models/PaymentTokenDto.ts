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
/**
 * 
 * @export
 * @interface PaymentTokenDto
 */
export interface PaymentTokenDto {
    /**
     * The ID of the payment token
     * @type {string}
     * @memberof PaymentTokenDto
     */
    paymentTokenId: string;
    /**
     * Name of the payment token
     * @type {string}
     * @memberof PaymentTokenDto
     */
    name: string;
    /**
     * Symbol of the payment token
     * @type {string}
     * @memberof PaymentTokenDto
     */
    symbol: string;
    /**
     * Address of the payment token
     * @type {string}
     * @memberof PaymentTokenDto
     */
    address?: string;
    /**
     * Decimals used by the payment token
     * @type {number}
     * @memberof PaymentTokenDto
     */
    decimals: number;
}

/**
 * Check if a given object implements the PaymentTokenDto interface.
 */
export function instanceOfPaymentTokenDto(value: object): boolean {
    if (!('paymentTokenId' in value)) return false;
    if (!('name' in value)) return false;
    if (!('symbol' in value)) return false;
    if (!('decimals' in value)) return false;
    return true;
}

export function PaymentTokenDtoFromJSON(json: any): PaymentTokenDto {
    return PaymentTokenDtoFromJSONTyped(json, false);
}

export function PaymentTokenDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): PaymentTokenDto {
    if (json == null) {
        return json;
    }
    return {
        
        'paymentTokenId': json['payment_token_id'],
        'name': json['name'],
        'symbol': json['symbol'],
        'address': json['address'] == null ? undefined : json['address'],
        'decimals': json['decimals'],
    };
}

export function PaymentTokenDtoToJSON(value?: PaymentTokenDto | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'payment_token_id': value['paymentTokenId'],
        'name': value['name'],
        'symbol': value['symbol'],
        'address': value['address'],
        'decimals': value['decimals'],
    };
}
