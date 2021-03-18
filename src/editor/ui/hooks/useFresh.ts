import * as React from "react";

export function useFresh() {
    const [ freshId, setFreshId ] = React.useState<string | null>(null);
    React.useEffect(() => {
        setFreshId(null);
    }, [freshId, setFreshId]);

    return [ freshId, setFreshId ] as const;
}
