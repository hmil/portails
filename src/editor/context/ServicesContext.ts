import { DisplayService } from "editor/ui/services/DisplayService";
import * as React from "react";

export interface ServicesContext {
    displayService: DisplayService;
}

export const ServicesContext = React.createContext<ServicesContext>({
    get displayService(): DisplayService {
        throw new Error('Context not initialized!')
    }
});
