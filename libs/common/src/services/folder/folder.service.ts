import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { FolderStateService } from "@bitwarden/common/abstractions/folder/folder-state.service.abstraction";
import { FolderServiceAbstraction } from "@bitwarden/common/abstractions/folder/folder.service.abstraction";
import { FolderData } from "@bitwarden/common/models/data/folderData";
import { Folder } from "@bitwarden/common/models/domain/folder";
import { FolderRequest } from "@bitwarden/common/models/request/folderRequest";
import { FolderResponse } from "@bitwarden/common/models/response/folderResponse";

export class FolderService implements FolderServiceAbstraction {
  constructor(private folderService: FolderStateService, private apiService: ApiService) {}

  async save(folder: Folder): Promise<any> {
    const request = new FolderRequest(folder);

    let response: FolderResponse;
    if (folder.id == null) {
      response = await this.apiService.postFolder(request);
      folder.id = response.id;
    } else {
      response = await this.apiService.putFolder(folder.id, request);
    }

    const data = new FolderData(response);
    await this.folderService.upsert(data);
  }

  async delete(id: string): Promise<any> {
    await this.apiService.deleteFolder(id);
    await this.folderService.delete(id);
  }
}
