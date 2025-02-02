import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NlbAlbLambdaPattern } from './poc-stack';

interface PocStackProps extends cdk.StackProps {
  lambdaName: string;
  albName: string;
  nlbName: string;
  AlbTargetGroupCDK: string;
}

export class PocStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PocStackProps) {
    super(scope, id, props);

    new NlbAlbLambdaPattern(this, 'NlbAlbLambdaPattern', {
      lambdaName: props.lambdaName,
      albName: props.albName,
      nlbName: props.nlbName,
      AlbTargetGroupCDK: props.AlbTargetGroupCDK,
      env: props.env,
    });
  }
}
