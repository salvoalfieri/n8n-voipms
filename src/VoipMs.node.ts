// ---------- Replace the top of src/VoipMs.node.ts with this ----------

/**
 * n8n SDK compatibility imports
 * Use `import type` to avoid runtime import issues and keep TS happy.
 */
import type { NodeExecuteFunctions } from 'n8n-core';
import {
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

/**
 * Simple ExecuteFunctions alias:
 * Prefer the modern NodeExecuteFunctions type; fall back to `any` so the
 * package compiles across different n8n versions without complex typeof checks.
 */
type ExecuteFunctions = NodeExecuteFunctions | any;

// ---------------------------------------------------------------------


export class VoipMs implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'VoIP.ms',
    name: 'voipMs',
    icon: 'file:voipms.png',
    group: ['transform'],
    version: 1,
    description: 'Interact with the VoIP.ms API',
    defaults: {
      name: 'VoIP.ms',
      color: '#00aaff',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'voipMsApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        options: [
          { name: 'Account', value: 'account' },
          { name: 'DID', value: 'did' },
          { name: 'SMS', value: 'sms' },
        ],
        default: 'account',
      },
      // Account operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['account'],
          },
        },
        options: [
          { name: 'Get Balance', value: 'getBalance' },
        ],
        default: 'getBalance',
      },
      // DID operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['did'],
          },
        },
        options: [
          { name: 'List DIDs', value: 'listDIDs' },
        ],
        default: 'listDIDs',
      },
      // SMS operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        displayOptions: {
          show: {
            resource: ['sms'],
          },
        },
        options: [
          { name: 'Send SMS', value: 'sendSMS' },
        ],
        default: 'sendSMS',
      },
      // SMS parameters
      {
        displayName: 'Source (From)',
        name: 'source',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['sms'],
            operation: ['sendSMS'],
          },
        },
      },
      {
        displayName: 'Destination (To)',
        name: 'destination',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['sms'],
            operation: ['sendSMS'],
          },
        },
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: {
            resource: ['sms'],
            operation: ['sendSMS'],
          },
        },
      },
    ],
  };

  /**
   * Helper: build base request options using credentials
   */
  async getBaseUrlAndAuth(this: ExecuteFunctions) {
    const credentials = await this.getCredentials('voipMsApi') as {
      apiUsername: string;
      apiPassword: string;
      baseUrl?: string;
    };

    if (!credentials) {
      throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
    }

    const baseUrl = credentials.baseUrl || 'https://api.voip.ms';
    const auth = {
      username: credentials.apiUsername,
      password: credentials.apiPassword,
    };

    return { baseUrl, auth };
  }

  async execute(this: ExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const length = items.length;
    for (let i = 0; i < length; i++) {
      const resource = this.getNodeParameter('resource', i) as string;
      const operation = this.getNodeParameter('operation', i) as string;

      const { baseUrl, auth } = await this.getBaseUrlAndAuth();

      try {
        if (resource === 'account' && operation === 'getBalance') {
          // VoIP.ms: getBalance -> method: GET, path: /api/v1/rest.php?api_username=...&api_password=...&method=getBalance
          const qs = {
            api_username: auth.username,
            api_password: auth.password,
            method: 'getBalance',
            format: 'json',
          };

          const response = await this.helpers.request({
            method: 'GET',
            uri: `${baseUrl}/api/v1/rest.php`,
            qs,
            json: true,
          });

          returnData.push({ json: response });

        } else if (resource === 'did' && operation === 'listDIDs') {
          // VoIP.ms: getDIDs -> method: getDIDs
          const qs = {
            api_username: auth.username,
            api_password: auth.password,
            method: 'getDIDs',
            format: 'json',
          };

          const response = await this.helpers.request({
            method: 'GET',
            uri: `${baseUrl}/api/v1/rest.php`,
            qs,
            json: true,
          });

          returnData.push({ json: response });

        } else if (resource === 'sms' && operation === 'sendSMS') {
          const source = this.getNodeParameter('source', i) as string;
          const destination = this.getNodeParameter('destination', i) as string;
          const message = this.getNodeParameter('message', i) as string;

          const qs = {
            api_username: auth.username,
            api_password: auth.password,
            method: 'sendSMS',
            format: 'json',
            source,
            destination,
            message,
          };

          const response = await this.helpers.request({
            method: 'GET',
            uri: `${baseUrl}/api/v1/rest.php`,
            qs,
            json: true,
          });

          returnData.push({ json: response });

        } else {
          throw new NodeOperationError(this.getNode(), `The resource/operation combination "${resource}/${operation}" is not implemented.`);
        }
      } catch (error: any) {
        // bubble up a helpful error
        throw new NodeOperationError(this.getNode(), `VoIP.ms API request failed: ${error.message || error}`);
      }
    }

    return [this.helpers.returnJsonArray(returnData.map(r => r.json))];
  }
}
