import { DeserializerService } from "editor/services/DeserializerService";
import { DisplayService } from "editor/services/DisplayService";
import { DownloadService } from "editor/services/DownloadService";
import { GridService } from "editor/services/GridService";
import { KeyboardShortcutService } from "editor/services/KeyboardShortcutService";
import { PersistenceService } from "editor/services/PersistenceService";
import { SerializerService } from "editor/services/SerializerService";
import * as React from "react";

export interface ServicesContext {
    displayService: DisplayService;
    keyboardShortcutService: KeyboardShortcutService;
    downloadService: DownloadService;
    serializerService: SerializerService;
    deserializerService: DeserializerService;
    gridService: GridService;
    persistenceService: PersistenceService;
}

export const ServicesContext = React.createContext<ServicesContext>({
    get displayService(): DisplayService {
        throw new Error('Context not initialized!')
    },
    get keyboardShortcutService(): KeyboardShortcutService {
        throw new Error('Context not initialized!')
    },
    get downloadService(): DownloadService {
        throw new Error('Context not initialized!')
    },
    get serializerService(): SerializerService {
        throw new Error('Context not initialized!')
    },
    get deserializerService(): DeserializerService {
        throw new Error('Context not initialized!')
    },
    get gridService(): GridService {
        throw new Error('Context not initialized!')
    },
    get persistenceService(): PersistenceService {
        throw new Error('Context not initialized!')
    }
});
