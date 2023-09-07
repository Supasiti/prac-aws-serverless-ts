#!/usr/bin/env node
// import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
// eslint-disable-next-line import/no-unresolved
import { FunctionStack } from './userServiceStack.js';

const project = 'pas';
const service = 'user';
const app = new cdk.App();
const rootId = `${project}-${service}-thara`;

console.log(`Deploying... ${rootId} Stack`);

new FunctionStack(app, `${rootId}-api`, {
  description: `${rootId} function stack`,
});
