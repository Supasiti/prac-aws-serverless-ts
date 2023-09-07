import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';

export class FunctionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fnName = 'getUser';

    const getUserHandler = new nodeLambda.NodejsFunction(this, fnName, {
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
    });

    const api = new apigw.RestApi(this, id, {
      ...props,
      restApiName: 'User Service',
    });

    const getUserIntegration = new apigw.LambdaIntegration(getUserHandler, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    const userPath = api.root.addResource('users');

    // get user by id
    userPath.addResource('{userID}').addMethod('GET', getUserIntegration, {
      requestParameters: {
        'method.request.path.userID': true,
      },
    });
  }
}
