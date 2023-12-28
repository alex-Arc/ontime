import { OSCSettings } from '../../definitions/core/OscSettings.type.js';
import { ReactClientType } from '../../definitions/core/ReactClient.type.js';

export type NetworkInterface = {
  name: string;
  address: string;
};

export interface GetInfo {
  networkInterfaces: NetworkInterface[];
  version: string;
  serverPort: number;
  osc: OSCSettings;
  cssOverride: string;
}

export type ProjectFile = {
  filename: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectFileList = Array<ProjectFile>;

export type ErrorResponse = {
  message: string;
};

export type ReactClientList = Array<ReactClientType>;
