import * as React from "react";

export function memo<Params extends any[], Retn extends any>(factory: (...args: Params) => Retn) {
    return (...args: Params): Retn => React.useMemo(() => factory(...args), args);
}

export function callback<Params extends any[], Retn extends (...args: any[]) => any>(factory: (...args: Params) => Retn) {
    return (...args: Params) => React.useCallback(factory(...args), args);
}

export function effect<Params extends any[]>(factory: (...args: Params) => ((() => void) | void)) {
    return (...args: Params) => React.useEffect(() => factory(...args), args);
}