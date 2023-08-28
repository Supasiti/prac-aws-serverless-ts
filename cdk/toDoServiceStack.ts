import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs';

export class FunctionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fnName = 'hello';

    const handler = new nodeLambda.NodejsFunction(this, fnName, {
      description: 'say hello world',
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: `./src/handlers/${fnName}.ts`,
      handler: 'handler',
      functionName: `${id}-${fnName}`,
      bundling: {
        target: 'es2020',
        format: nodeLambda.OutputFormat.ESM,
        sourceMap: true,
      },
    });

    const api = new apigw.RestApi(this, id, {
      ...props,
      restApiName: "Hello Service",
    });

    const sayHelloIntegration = new apigw.LambdaIntegration(handler, {
      requestTemplates: { "application/json": '{ "statusCode": "200" }' }
    });

    api.root.addMethod("GET", sayHelloIntegration); 
  }
}
