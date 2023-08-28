#!/usr/bin/env node
// import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FunctionStack } from './toDoServiceStack.js';

const project = 'pas';
const service = 'todo';
const app = new cdk.App();
const rootId = `${project}-${service}-thara`;

console.log(`Deploying... ${rootId} Stack`);

new FunctionStack(app, `${rootId}-api`, {
  description: `${rootId} function stack`,
});
