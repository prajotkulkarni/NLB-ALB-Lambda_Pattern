import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { PocStack } from '../lib/pocl3';

test('Load Balancer and Lambda Exist', () => {
  const app = new cdk.App();

  const env = {
    account: '123456789012',
    region: 'us-east-1',
  };

  // Create the stack with environment configuration
  const stack = new PocStack(app, 'TestPocStack', {
    env,
    lambdaName: 'MyLambdaFunction',
    albName: 'MyApplicationLoadBalancer',
    nlbName: 'MyNetworkLoadBalancer',
    AlbTargetGroupCDK: 'MyAlbTargetGroup',
  });

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
