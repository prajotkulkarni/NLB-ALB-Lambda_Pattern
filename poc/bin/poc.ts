#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PocStack } from '../lib/poc-stack';

const app = new cdk.App();

// Set the environment variables
process.env.CDK_DEFAULT_ACCOUNT = '481331750683';
process.env.CDK_DEFAULT_REGION = 'us-east-1';

new PocStack(app, 'PocStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
