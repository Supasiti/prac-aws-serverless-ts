import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

type ResourceStackProps = cdk.StackProps & {
  tableName: string;
};

export class ResourceStack extends cdk.Stack {
  readonly userTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props: ResourceStackProps) {
    super(scope, id, props);

    this.userTable = this.addUserTable(id, props);
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
}
