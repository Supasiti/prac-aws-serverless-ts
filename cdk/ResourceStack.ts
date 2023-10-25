import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as cdk from 'aws-cdk-lib';

type ResourceStackProps = cdk.StackProps & {
  tableName: string;
  snsTopic: string;
};

export class ResourceStack extends cdk.Stack {
  readonly userTable: dynamodb.Table;
  readonly userTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: ResourceStackProps) {
    super(scope, id, props);

    this.userTable = this.addUserTable(id, props);
    this.userTopic = this.addSnsTopic(props);
  }

  addUserTable(id: string, props: ResourceStackProps) {
    const { tableName } = props;

    const table = new dynamodb.Table(this, `${id}-user`, {
      tableName,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: '$pk',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: '$sk',
        type: dynamodb.AttributeType.STRING,
      },
    });

    return table;
  }

  addSnsTopic(props: ResourceStackProps) {
    const { snsTopic } = props;

    const topic = new sns.Topic(this, snsTopic, {
      topicName: snsTopic,
    });

    return topic;
  }
}
