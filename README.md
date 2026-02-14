# n8n-nodes-voipms

Scaffolded TypeScript n8n node package for VoIP.ms API.

## Prerequisites

- Node.js (LTS) and npm
- `n8n-node-dev` installed globally for easy build + deploy:
  npm install -g n8n-node-dev

## Build locally

1. Install dependencies:
   npm install

2. Build:
   npm run build

## Develop and deploy to your self-hosted n8n

Using `n8n-node-dev` (recommended):

1. From this package root run:
   n8n-node-dev build --destination ~/.n8n/custom

2. Restart your n8n process (systemd, pm2, or however you run it).

3. In the n8n UI, create credentials of type "VoIP.ms API" and provide your API username and password (API key). Then add the "VoIP.ms" node to a workflow and test operations.

## Notes

- This scaffold uses simple GET requests to the VoIP.ms REST endpoint. Extend parameters, error handling, and response normalization as needed.
- Add icons: place `voipms.png` in the package root or adjust `icon` path in the node description.
