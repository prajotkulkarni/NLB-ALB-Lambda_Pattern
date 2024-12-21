#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PocStack } from '../lib/poc-stack';

const app = new cdk.App();
new PocStack(app, 'PocStack', {
  
  env: { account: '481331750683', region: 'us-east-1' },

});