import { createServiceModule } from "./injector";

export class DownloadService {

    download(data: Blob, name: string) {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = URL.createObjectURL(data);
        document.body.append(a);
        a.download = name;
        a.click();
        document.body.removeChild(a);
    }
}

export const DownloadServiceModule = createServiceModule(DownloadService);
