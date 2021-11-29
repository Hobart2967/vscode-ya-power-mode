import { Type } from './type.interface';
export declare type Provider = Type<any> | DetailedProvider;
export declare type ProviderType = string | Type<any>;

export interface DetailedProvider { provide: ProviderType; useClass?: Type<any>; useValue?: any; }
