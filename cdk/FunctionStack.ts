import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import dotenv from 'dotenv';
import path from 'path';

import { createDynamoDbTableIAMPolicy } from './iam.js';

dotenv.config({ path: path.join(process.cwd(), 'config/dev.env') });

const REGION = process.env.AWS_REGION || '';

type FunctionStackProps = cdk.StackProps & {
  userTableName: string;
};

export class FunctionStack extends cdk.Stack {
  private readonly api: apigw.RestApi;
  private readonly userPath: apigw.Resource;
  private readonly userTablePolicy: iam.Policy;

  constructor(scope: Construct, id: string, props: FunctionStackProps) {
    super(scope, id, props);

    this.api = new apigw.RestApi(this, id, {
      ...props,
      restApiName: 'User Service',
    });
    this.userPath = this.api.root.addResource('users');

    this.userTablePolicy = createDynamoDbTableIAMPolicy({
      actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
      policyName: `${id}-dynamodb-policy`,
      resourceNames: [props.userTableName],
      stack: this,
    });

    this.addGetUserApi(id, props);
    this.addCreateUserApi(id, props);
  }

  addGetUserApi(id: string, props: FunctionStackProps) {
    const { userTableName } = props;
    const fnName = 'getUser';

    const fn = new nodeLambda.NodejsFunction(this, fnName, {
      ...props,
      description: 'get user details by id',
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `./src/handlers/${fnName}.ts`,
      handler: 'handler',
      functionName: `${id}-${fnName}`,
      bundling: {
        target: 'es2020',
        format: nodeLambda.OutputFormat.ESM,
        sourceMap: true,
        // This banner is required to load the node specific libs like "os" dynamically
        // From: https://github.com/evanw/esbuild/issues/1921#issuecomment-1152887672
        banner:
          "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
      },
      environment: {
        USER_TABLE_NAME: userTableName,
        REGION: REGION,
      },
    });

    fn.role?.attachInlinePolicy(this.userTablePolicy);

    const apiIntegration = new apigw.LambdaIntegration(fn, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    // get user by id
    this.userPath.addResource('{userID}').addMethod('GET', apiIntegration, {
      requestParameters: {
        'method.request.path.userID': true,
      },
    });
  }

  addCreateUserApi(id: string, props: FunctionStackProps) {
    const { userTableName } = props;
    const fnName = 'createUser';

    const fn = new nodeLambda.NodejsFunction(this, fnName, {
      ...props,
      description: 'create new user',
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `./src/handlers/${fnName}.ts`,
      handler: 'handler',
      functionName: `${id}-${fnName}`,
      bundling: {
        target: 'es2020',
        format: nodeLambda.OutputFormat.ESM,
        sourceMap: true,
        // This banner is required to load the node specific libs like "os" dynamically
        // From: https://github.com/evanw/esbuild/issues/1921#issuecomment-1152887672
        banner:
          "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
      },
      environment: {
        USER_TABLE_NAME: userTableName,
        REGION: REGION,
      },
    });

    fn.role?.attachInlinePolicy(this.userTablePolicy);

    const apiIntegration = new apigw.LambdaIntegration(fn, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    // attach post method
    // We prefer to validate request body ourselves
    this.userPath.addMethod('POST', apiIntegration);
  }
}
