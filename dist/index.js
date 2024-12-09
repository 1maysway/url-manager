function hasDuplicateRoutes(config) {
    function checkBranch(currentConfig, seenRoutes = new Set()) {
        if (currentConfig.branches) {
            const branchSeenRoutes = new Set();
            for (const branch of currentConfig.branches) {
                if (branchSeenRoutes.has(branch.route)) {
                    return true;
                }
                branchSeenRoutes.add(branch.route);
                if (checkBranch(branch)) {
                    return true;
                }
            }
        }
        return false;
    }
    return checkBranch(config);
}
function validateRoute(route, config) {
    const routeParts = route.split('/').filter(Boolean);
    function matchRoute(parts, currentConfig) {
        if (parts.length === 0) {
            return true;
        }
        const [currentPart, ...remainingParts] = parts;
        const configRoute = currentConfig.route;
        // Handle empty root route
        if (configRoute === '' && currentConfig.branches) {
            return currentConfig.branches.some((branch) => matchRoute(parts, branch));
        }
        // Check if current part matches config route or is a parameter
        const isMatch = currentPart === configRoute ||
            (configRoute.startsWith('{') && configRoute.endsWith('}'));
        if (!isMatch) {
            return false;
        }
        // If we have more parts to match but no branches, invalid
        if (remainingParts.length > 0 && !currentConfig.branches) {
            return false;
        }
        // If we've matched all parts, valid
        if (remainingParts.length === 0) {
            return true;
        }
        // Try to match remaining parts against branches
        return (currentConfig.branches?.some((branch) => matchRoute(remainingParts, branch)) ?? false);
    }
    return matchRoute(routeParts, config);
}
function extractParamsFromPath(templateRoute, actualPath) {
    const templateParts = templateRoute.split('/').filter(Boolean);
    const pathParts = actualPath.split('/').filter(Boolean);
    const params = {};
    templateParts.forEach((part, index) => {
        if (part.startsWith('{') && part.endsWith('}')) {
            const paramName = part.slice(1, -1);
            params[paramName] = pathParts[index] || '';
        }
    });
    return params;
}
function extractRequiredParams(route) {
    return route
        .split('/')
        .filter(Boolean)
        .filter((part) => part.startsWith('{') && part.endsWith('}'))
        .map((part) => part.slice(1, -1));
}

function createURLManager(config) {
    if (hasDuplicateRoutes(config)) {
        throw new Error('Config contains duplicate routes in the same branch');
    }
    return function buildURL(route, params, options) {
        if (!validateRoute(route, config)) {
            throw new Error(`Invalid route: ${route}`);
        }
        const currentPath = options?.currentPath ||
            (typeof window !== 'undefined' ? window.location.pathname : '');
        const existingParams = extractParamsFromPath(route, currentPath);
        const requiredParams = extractRequiredParams(route);
        let finalUrl = route;
        for (const paramName of requiredParams) {
            const paramValue = params?.[paramName] || existingParams[paramName];
            if (!paramValue) {
                throw new Error(`Missing required parameter: ${paramName}`);
            }
            finalUrl = finalUrl.replace(`{${paramName}}`, paramValue);
        }
        return '/' + finalUrl.replace(/^\/+|\/+$/g, '');
    };
}

export { createURLManager };
//# sourceMappingURL=index.js.map
