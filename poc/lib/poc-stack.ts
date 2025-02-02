import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { CfnOutput } from 'aws-cdk-lib';

interface NlbAlbLambdaPatternProps extends cdk.StackProps {
  readonly lambdaName: string;
  readonly albName: string;
  readonly nlbName: string;
  readonly AlbTargetGroupCDK: string;
  readonly env?: cdk.Environment;
}

export class NlbAlbLambdaPattern extends Construct {
  constructor(scope: Construct, id: string, props: NlbAlbLambdaPatternProps) {
    super(scope, id);

    const vpc = ec2.Vpc.fromLookup(this, 'VPC', { vpcName: 'vpc' });
    const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'forcdk', 'sg-0d02f9bcd110a67fa');

    const lambdaFunction = new lambda.Function(this, props.lambdaName, {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async function(event) {
          return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/html' },
            body: \`
              <html>
                <body>
                  <h1>Hello World from Load Balancers</h1>
                </body>
              </html>
            \`,
          };
        };
      `),
    });

    const appLoadBalancer = new elbv2.ApplicationLoadBalancer(this, props.albName, {
      vpc,
      internetFacing: true,
      securityGroup,
    });
    const albListener = appLoadBalancer.addListener('AppLoadBalancerListener', { port: 80 });
    albListener.addTargets('AppLoadBalancerTargets', {
      targets: [new targets.LambdaTarget(lambdaFunction)],
      healthCheck: {
        enabled: true,
      },
    });

    new CfnOutput(this, 'ALBDNSName', {
      value: appLoadBalancer.loadBalancerDnsName,
    });

    new CfnOutput(this, 'ALBArn', {
      value: appLoadBalancer.loadBalancerArn,
    });

    const netLoadBalancer = new elbv2.NetworkLoadBalancer(this, props.nlbName, {
      vpc,
      internetFacing: true,
      securityGroups: [securityGroup],
      ipAddressType: elbv2.IpAddressType.IPV4,
    });

    const albTargetGroup = new elbv2.CfnTargetGroup(this, props.AlbTargetGroupCDK, {
      vpcId: vpc.vpcId,
      port: 80,
      protocol: 'TCP',
      healthCheckEnabled: true,
      healthCheckPath: '/',
      healthCheckPort: '80',
      healthCheckProtocol: 'HTTP',
      healthCheckIntervalSeconds: 30,
      healthCheckTimeoutSeconds: 5,
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 2,
      targetType: 'alb',
      targets: [{ id: appLoadBalancer.loadBalancerArn, port: 80 }],
      name: 'cfnCDKAlbTargetGroup',
    });

    new elbv2.CfnListener(this, 'NlbListener', {
      loadBalancerArn: netLoadBalancer.loadBalancerArn,
      port: 80,
      protocol: 'TCP',
      defaultActions: [{
        type: 'forward',
        targetGroupArn: albTargetGroup.ref,
      }],
    });

    new CfnOutput(this, 'NLBDNSName', {
      value: netLoadBalancer.loadBalancerDnsName,
    });
  }
}
