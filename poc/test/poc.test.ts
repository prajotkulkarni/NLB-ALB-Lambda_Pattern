// test/poc.test.ts
import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { PocStack } from '../lib/poc-stack';

test('Load Balancer and Lambda Exist', () => {
  const app = new cdk.App();

  // Set up the environment configuration
  const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT || '481331750683', // Use fallback account ID
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',      // Use fallback region
  };

  // Create the stack with environment configuration
  const stack = new PocStack(app, 'PocStack', { env });

  const template = Template.fromStack(stack);

  // Check if Application Load Balancer is created
  template.hasResourceProperties('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    Type: 'application',
    Scheme: 'internet-facing',
  });

  // Check if Network Load Balancer is created
  template.hasResourceProperties('AWS::ElasticLoadBalancingV2::LoadBalancer', {
    Type: 'network',
    Scheme: 'internet-facing',
  });

  // Check if Lambda Function is created
  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'nodejs22.x',
    Handler: 'index.handler',
  });
});