import { RouteConfig } from './types';
export declare function hasDuplicateRoutes(config: RouteConfig): boolean;
export declare function validateRoute(route: string, config: RouteConfig): boolean;
export declare function extractParamsFromPath(templateRoute: string, actualPath: string): Record<string, string>;
export declare function extractRequiredParams(route: string): string[];
