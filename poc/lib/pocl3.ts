import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NlbAlbLambdaPattern } from './poc-stack';

export class PocStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
      },
      ...props
    });

    new NlbAlbLambdaPattern(this, 'NlbAlbLambdaPattern', {
      lambdaName: 'testLambda',
      albName: 'myALB',
      nlbName: 'myNLB',
      AlbTargetGroupCDK: 'myALBtg'
    });
  }
}
