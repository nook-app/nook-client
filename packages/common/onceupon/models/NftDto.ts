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
 * @interface NftDto
 */
export interface NftDto {
    /**
     * 
     * @type {number}
     * @memberof NftDto
     */
    chainId: number;
    /**
     * 
     * @type {string}
     * @memberof NftDto
     */
    token: string;
    /**
     * 
     * @type {string}
     * @memberof NftDto
     */
    owner: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof NftDto
     */
    tokens: Array<string>;
    /**
     * 
     * @type {number}
     * @memberof NftDto
     */
    totalTokens: number;
}

/**
 * Check if a given object implements the NftDto interface.
 */
export function instanceOfNftDto(value: object): boolean {
    if (!('chainId' in value)) return false;
    if (!('token' in value)) return false;
    if (!('owner' in value)) return false;
    if (!('tokens' in value)) return false;
    if (!('totalTokens' in value)) return false;
    return true;
}

export function NftDtoFromJSON(json: any): NftDto {
    return NftDtoFromJSONTyped(json, false);
}

export function NftDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): NftDto {
    if (json == null) {
        return json;
    }
    return {
        
        'chainId': json['chainId'],
        'token': json['token'],
        'owner': json['owner'],
        'tokens': json['tokens'],
        'totalTokens': json['totalTokens'],
    };
}

export function NftDtoToJSON(value?: NftDto | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'chainId': value['chainId'],
        'token': value['token'],
        'owner': value['owner'],
        'tokens': value['tokens'],
        'totalTokens': value['totalTokens'],
    };
}

