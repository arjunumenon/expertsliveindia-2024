import { ClientSecretCredential } from '@azure/identity';
import { Client, MiddlewareFactory } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js';
import { CompleteJobWithDelayMiddleware } from './completeJobWithDelayMiddleware.js';
import { DebugMiddleware } from './debugMiddleware.js';
import { appInfo } from './env.js';

const credential = new ClientSecretCredential(
  appInfo.tenantId,
  appInfo.appId,
  appInfo.secrets[0].value
);

const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['https://graph.microsoft.com/.default'],
});

const middleware = MiddlewareFactory.getDefaultMiddlewareChain(authProvider);
// add as a second middleware to get access to the access token
middleware.splice(1, 0, new CompleteJobWithDelayMiddleware(60000));
// add just before executing the request to get access to all headers
// middleware.splice(-1, 0, new DebugMiddleware());

export const client = Client.initWithMiddleware({ middleware });
