/**
 * DESIGN BY CONTRACT
 * ===================
 * All websocket calls are expected to follow the defined format,
 * otherwise they will be ignored by Ontime server
 *
 * Messages should be in JSON format with two top level objects
 * {
 *   type: ...
 *   payload: ...
 * }
 *
 * Type: describes the action to be performed as enumerated in the API design
 * Payload: adds necessary payload for the request to be completed
 */

import { LogOrigin, ReactClient } from 'ontime-types';

import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';

import getRandomName from '../utils/getRandomName.js';
import { IAdapter } from './IAdapter.js';
import { eventStore } from '../stores/EventStore.js';
import { dispatchFromAdapter } from '../controllers/integrationController.js';
import { logger } from '../classes/Logger.js';

let instance;

type ReactClientWS = ReactClient & { ws: WebSocket };
export class SocketServer implements IAdapter {
  private readonly MAX_PAYLOAD = 1024 * 256; // 256Kb

  private wss: WebSocketServer | null;
  private readonly clients: Map<string, ReactClientWS>;

  constructor() {
    if (instance) {
      throw new Error('There can be only one');
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias -- this logic is used to ensure singleton
    instance = this;
    this.clients = new Map<string, ReactClientWS>();
    this.wss = null;
  }

  init(server: Server) {
    this.wss = new WebSocketServer({ path: '/ws', server });

    this.wss.on('connection', (ws: WebSocket) => {
      let clientId = getRandomName();
      this.clients.set(clientId, { name: clientId, url: '', parameters: '', ws });
      logger.info(LogOrigin.Client, `${this.wss.clients.size} Connections with new: ${clientId}`);

      // send store payload on connect
      ws.send(
        JSON.stringify({
          type: 'ontime',
          payload: eventStore.poll(),
        }),
      );

      ws.send(
        JSON.stringify({
          type: 'client-name',
          payload: clientId,
        }),
      );

      ws.on('error', console.error);

      ws.on('close', () => {
        logger.info(LogOrigin.Client, `${this.wss.clients.size} Connections with disconnected: ${clientId}`);
        this.clients.delete(clientId);
      });

      ws.on('message', (data) => {
        if (data.length > this.MAX_PAYLOAD) {
          ws.close();
        }

        try {
          const message = JSON.parse(data);
          const { type, payload } = message;

          if (type === 'get-client-name') {
            ws.send(
              JSON.stringify({
                type: 'client-name',
                payload: clientId,
              }),
            );
            return;
          }

          if (type === 'set-client-name') {
            if (payload) {
              const previousName = clientId;
              clientId = payload;
              const prevData = this.clients.get(previousName);
              this.clients.delete(previousName);
              const name = clientId;
              this.clients.set(clientId, { ...prevData, name });
              logger.info(LogOrigin.Client, `Client ${previousName} renamed to ${clientId}`);
            }
            ws.send(
              JSON.stringify({
                type: 'client-name',
                payload: clientId,
              }),
            );
            return;
          }

          if (type === 'set-client-url') {
            if (payload) {
              const url = payload;
              this.clients.set(clientId, { ...this.clients.get(clientId), url });
              // logger.info(LogOrigin.Client, `Client ${previousName} renamed to ${clientId}`);
            }
            return;
          }

          if (type === 'set-client-parameters') {
            if (payload) {
              const parameters = payload;
              this.clients.set(clientId, { ...this.clients.get(clientId), parameters });
              // logger.info(LogOrigin.Client, `Client ${previousName} renamed to ${clientId}`);
            }
            return;
          }

          if (type === 'hello') {
            ws.send('hi');
            return;
          }

          if (type === 'ontime-log') {
            if (payload.level && payload.origin && payload.text) {
              logger.emit(payload.level, payload.origin, payload.text);
            }
            return;
          }

          // Protocol specific stuff handled above
          try {
            const reply = dispatchFromAdapter(
              type,
              {
                payload,
              },
              'ws',
            );
            if (reply) {
              const { payload } = reply;
              ws.send(type, payload);
            }
          } catch (error) {
            logger.error(LogOrigin.Rx, `WS IN: ${error}`);
          }
        } catch (_) {
          // we ignore unknown
        }
      });
    });
  }

  // message is any serializable value
  sendAsJson(message: unknown) {
    this.wss?.clients.forEach((client) => {
      if (client !== this.wss && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  getClientList(): Array<ReactClient> {
    const list = new Array(0);
    this.clients.forEach((value) => list.push({ ...value, ws: '' }));
    list.map((value) => {
      delete value.ws;
    });
    return list;
  }

  sendToClient(name: string, message: unknown) {
    if (this.clients.has(name)) {
      const { ws } = this.clients.get(name);
      ws.send(JSON.stringify(message));
    } else {
      throw new Error(`Client: ${name} dose not exist`);
    }
  }

  shutdown() {
    this.wss?.close();
  }
}

export const socket = new SocketServer();
