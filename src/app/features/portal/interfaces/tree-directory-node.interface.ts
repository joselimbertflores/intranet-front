import { TreeDirectoryResponse } from "../../administration/directory/interfaces";

export interface TreeDirectoryNode extends TreeDirectoryResponse {
  expanded?: boolean;
}
