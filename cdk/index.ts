#!/usr/bin/env node
// import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FunctionStack } from './FunctionStack.js';
import { ResourceStack } from './ResourceStack.js';

const project = 'pas';
const service = 'user';
const app = new cdk.App();
const rootId = `${project}-${service}-thara`;
const tableName = `${rootId}-user`;

console.log(`Deploying... ${rootId} Stack`);

new ResourceStack(app, `${rootId}`, {
  description: `${rootId} resource stack`,
  tableName,
});

new FunctionStack(app, `${rootId}-api`, {
  description: `${rootId} function stack`,
  userTableName: tableName,
});
