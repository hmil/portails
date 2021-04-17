import { Scene } from "editor/model/scene";
import { loadScene } from "editor/state/actions";
import { AppActions } from "editor/state/reducer";
import { DeserializerService } from "./DeserializerService";
import { DownloadService } from "./DownloadService";
import { createServiceModule } from "./injector";
import { SerializerService } from "./SerializerService";

export class PersistenceService {
    
    constructor(
            private readonly scene: Scene,
            private readonly dispatch: React.Dispatch<AppActions>,
            private readonly serializerService: SerializerService,
            private readonly deserializerService: DeserializerService,
            private readonly downloadService: DownloadService) {}


    save = () => {
        if (this.scene == null) {
            throw new Error('No scene to save');
        }
        const ser = JSON.stringify(this.serializerService.toDTO(this.scene), null, 4);
        const blob = new Blob([ser], { type: 'application/prs.portails-level+json'})
        this.downloadService.download(blob, 'level.json');
    }

    load = async () => {
        const response = await fetch('/static/level.json');
        const json = await response.text();
        const scene = this.deserializerService.deserialize(json);
        this.dispatch(loadScene({scene}));
    }
}

export const PersistenceServiceModule = createServiceModule(PersistenceService);
