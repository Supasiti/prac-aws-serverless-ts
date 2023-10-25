import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as eventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import dotenv from 'dotenv';
import path from 'path';

import { createDynamoDbTableIAMPolicy, createSnsIAMPolicy } from './iam.js';
import { createLambda } from './Lambda.js';

dotenv.config({ path: path.join(process.cwd(), 'config/dev.env') });

const REGION = process.env.AWS_REGION || '';

type FunctionStackProps = cdk.StackProps & {
  userTableName: string;
  snsTopic: string;
};

export class FunctionStack extends cdk.Stack {
  private readonly api: apigw.RestApi;
  private readonly userPath: apigw.Resource;
  private readonly userTablePolicy: iam.Policy;
  private readonly userTopic: sns.ITopic;
  private readonly userTopicPolicy: iam.Policy;

  constructor(scope: Construct, id: string, props: FunctionStackProps) {
    super(scope, id, props);

    const { snsTopic } = props;

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

    this.userTopic = sns.Topic.fromTopicArn(
      this,
      snsTopic,
      `arn:aws:sns:${REGION}:${this.account}:${snsTopic}`,
    );
    this.userTopicPolicy = createSnsIAMPolicy({
      actions: ['sns:Publish'],
      policyName: `${id}-topic-policy`,
      resourceNames: [props.snsTopic],
      stack: this,
    });

    this.addGetUserApi(id, props);
    this.addCreateUserApi(id, props);
    this.addMessageLogger(id);
  }

  addGetUserApi(id: string, props: FunctionStackProps) {
    const { userTableName } = props;
    const fnName = 'getUser';

    const fn = createLambda(this, {
      id,
      fnName,
      description: 'get user details by id',
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

    const fn = createLambda(this, {
      id,
      fnName,
      description: 'create new user',
      environment: {
        USER_TABLE_NAME: userTableName,
        REGION: REGION,
        SNS_TOPIC: this.userTopic.topicArn,
      },
    });

    fn.role?.attachInlinePolicy(this.userTablePolicy);
    fn.role?.attachInlinePolicy(this.userTopicPolicy);

    const apiIntegration = new apigw.LambdaIntegration(fn, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    // attach post method
    // We prefer to validate request body ourselves
    this.userPath.addMethod('POST', apiIntegration);
  }

  addMessageLogger(id: string) {
    const fnName = 'messageLogger';

    const fn = createLambda(this, {
      id,
      fnName,
      description: 'log sns message',
    });

    fn.addEventSource(new eventSources.SnsEventSource(this.userTopic));
  }
}
