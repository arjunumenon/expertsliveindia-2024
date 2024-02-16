# About

This is the repository which contains the artifacts used by Arjun Menon in Experts Live India for the session **Introduction to M365 Graph Connector - Get External Content to Microsoft 365 - Arjun**

## Summary

This samples contains a Microsoft Graph connector that shows how to ingest sample solutions from the [Microsoft 365 and Power Platform community sample gallery](https://adoption.microsoft.com/sample-solution-gallery/?keyword=&sort-by=creationDateTime-true&page=1). It gives you a very convenient way to search for and reference community samples right from your tenant!

![Microsoft 365 and Power Platform community rate limit samples displayed in Microsoft Search](assets/sample-rich.png)

## Prerequisites

- [Microsoft 365 Developer tenant](https://developer.microsoft.com/microsoft-365/dev-program)
- [Node@18](https://nodejs.org)
- Bash

## Minimal path to awesome

- Make the setup script executable, by running `chmod +x ./setup.sh`
- Run the setup script: on macOS: `./setup.sh`, on Windows `.\setup.ps1`. When finished, it will create a local `env.js` file with information about the AAD app, required to run the code
- Restore dependencies: `npm install`
- Create the external connection: `npm run createConnection` (this will take several minutes)
- Ingest the content: `npm run loadContent`

## Features

This demo shows how to ingest Product Categories from your enteprise APIs into your Microsoft 365 tenant.

The demo illustrates the following concepts:

- script creating the Entra ID (Azure AD) application using CLI for Microsoft 365
- create external connection including URL to item resolver to track activity when users share external links
- create external connection schema
- retrieve data from a remote API and store it in a local cache for future use
- support incremental ingestion by tracking the last modified date of the newest sample
- ingesting items with up to 10 parallel connections to speed up the ingestion
- logging errors for easy debugging
- visualize the external content in search results using a custom Adaptive Card
- extend Microsoft Graph JavaScript SDK with a [middleware to wait for a long-running operation to complete](https://blog.mastykarz.nl/easily-handle-long-running-operations-middleware-microsoft-graph-javascript-sdk/)
- extend Microsoft Graph JavaScript SDK with a [debug middleware](https://blog.mastykarz.nl/easily-debug-microsoft-graph-javascript-sdk-requests/) to show information about outgoing requests and incoming responses