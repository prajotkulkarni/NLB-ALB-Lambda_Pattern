#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PocStack } from '../lib/pocl3';

const app = new cdk.App();
new PocStack(app, 'PocStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  lambdaName: 'MyLambdaFunction',
  albName: 'MyApplicationLoadBalancer',
  nlbName: 'MyNetworkLoadBalancer',
  AlbTargetGroupCDK: 'MyAlbTargetGroup'
});
