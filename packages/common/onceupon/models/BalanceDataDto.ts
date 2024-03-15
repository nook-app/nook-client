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
 * @interface BalanceDataDto
 */
export interface BalanceDataDto {
    /**
     * Mapping of chain IDs to their respective balances
     * @type {{ [key: string]: { [key: string]: string; }; }}
     * @memberof BalanceDataDto
     */
    balances: { [key: string]: { [key: string]: string; }; };
}

/**
 * Check if a given object implements the BalanceDataDto interface.
 */
export function instanceOfBalanceDataDto(value: object): boolean {
    if (!('balances' in value)) return false;
    return true;
}

export function BalanceDataDtoFromJSON(json: any): BalanceDataDto {
    return BalanceDataDtoFromJSONTyped(json, false);
}

export function BalanceDataDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): BalanceDataDto {
    if (json == null) {
        return json;
    }
    return {
        
        'balances': json['balances'],
    };
}

export function BalanceDataDtoToJSON(value?: BalanceDataDto | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'balances': value['balances'],
    };
}

