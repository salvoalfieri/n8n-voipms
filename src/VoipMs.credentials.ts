import {
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class VoipMsApi implements ICredentialType {
  name = 'voipMsApi';
  displayName = 'VoIP.ms API';
  documentationUrl = 'https://voip.ms/m/apidocs.php';
  properties: INodeProperties[] = [
    {
      displayName: 'API Username',
      name: 'apiUsername',
      type: 'string',
      default: '',
      required: true,
      description: 'Your VoIP.ms API username',
    },
    {
      displayName: 'API Password',
      name: 'apiPassword',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your VoIP.ms API password (API key)',
    },
    {
      displayName: 'API Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.voip.ms',
      required: true,
      description: 'VoIP.ms API base URL (keep default unless instructed otherwise)',
    },
  ];
}
