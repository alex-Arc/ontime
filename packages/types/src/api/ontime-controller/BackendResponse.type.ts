import { OSCSettings } from '../../definitions/core/OscSettings.type.js';

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

export type ClientList = Array<{ name: string; url: string }>;
