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
 * @interface PfpDto
 */
export interface PfpDto {
    /**
     * URL of the profile picture
     * @type {string}
     * @memberof PfpDto
     */
    url: string;
}

/**
 * Check if a given object implements the PfpDto interface.
 */
export function instanceOfPfpDto(value: object): boolean {
    if (!('url' in value)) return false;
    return true;
}

export function PfpDtoFromJSON(json: any): PfpDto {
    return PfpDtoFromJSONTyped(json, false);
}

export function PfpDtoFromJSONTyped(json: any, ignoreDiscriminator: boolean): PfpDto {
    if (json == null) {
        return json;
    }
    return {
        
        'url': json['url'],
    };
}

export function PfpDtoToJSON(value?: PfpDto | null): any {
    if (value == null) {
        return value;
    }
    return {
        
        'url': value['url'],
    };
}

