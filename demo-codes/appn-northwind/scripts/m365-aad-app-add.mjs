#!/usr/bin/env zx

//Check if Windows Terminal. If Windows Terminal, set the shell to bash.exe
if (!!process.env.WT_SESSION) {
    $.shell = `C:/Program Files/Git/usr/bin/bash.exe`;
}

async function createAADApp(appName, apiPermissions, exposeAPIURL) {
    console.log(`Creating Azure AD app ${appName}...`);
    let createdApp = null;
    try {
        // Create the Azure AD app
        createdApp = JSON.parse(await $`m365 entra app add --name ${appName} --apisDelegated ${apiPermissions}  --redirectUris 'https://login.microsoftonline.com/common/oauth2/nativeclient, https://${exposeAPIURL}' --platform spa --grantAdminConsent  --multitenant --withSecret --uri api://${exposeAPIURL}/_appId_ --scopeName access_as_user --scopeAdminConsentDescription 'Access the application as Logged in User' --scopeAdminConsentDisplayName 'Access as the logged in User' --scopeConsentBy admins --withSecret --save --output json`);
    }
    catch (err) {
        console.error(`  ${chalk.red(err.stderr)}`);
    }
    return createdApp;
}

// For Production
// const appName = 'Teams App Camp App June3-V1';
//For Development
const appName = 'Exports Live India - 2024 - AAD';
const apiPermissions = 'https://graph.microsoft.com/User.Read';

// //For Development
const exposeAPIURL = 'b172-106-51-160-179.ngrok-free.app';
// //For Production
// const exposeAPIURL = 'teams-appcamp-june3.azurewebsites.net';

const appCreated = await createAADApp(appName, apiPermissions, exposeAPIURL);