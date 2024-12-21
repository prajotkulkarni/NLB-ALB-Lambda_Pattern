import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnOutput } from 'aws-cdk-lib'

export class PocStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'VPC', { 
      vpcName: 'vpc' 
    });
    const sgForcdk = ec2.SecurityGroup.fromSecurityGroupId(this, 'forcdk', 'sg-0d02f9bcd110a67fa');

    const CDKlambda = new lambda.Function(this, 'CDKlambda', { 
      runtime: lambda.Runtime.NODEJS_22_X, 
      handler: 'index.handler', 
      code: lambda.Code.fromInline(`
        exports.handler = async function(event) {
        return {
        statusCode: 200,
        body: JSON.stringify('Hello World from Load Balancers'),
        };
        };
        `), 
    });

    const AppLoadBalancer = new elbv2.ApplicationLoadBalancer(this, 'AppLoadBalancer', {
      vpc,
      internetFacing: true,
      securityGroup: sgForcdk,
    });
    const ALBlistener = AppLoadBalancer.addListener('AppLoadBalancerListener', { port: 80 });
    ALBlistener.addTargets('AppLoadBalancerTargets', {
      targets: [new targets.LambdaTarget(CDKlambda)],
      healthCheck: {
        enabled: true,
      }
    });

    new CfnOutput(this, 'ALBDNSName', { 
      value: AppLoadBalancer.loadBalancerDnsName, 
    }); 

    new CfnOutput(this, 'ALBArn', { 
      value: AppLoadBalancer.loadBalancerArn, 
    });


    const NetworkLoadBalancer = new elbv2.NetworkLoadBalancer(this, 'NetLoadBalancer', {
      vpc,
      internetFacing: true,
      securityGroups: [sgForcdk],
      ipAddressType: elbv2.IpAddressType.IPV4,
    });
    
    const albTargetGroup = new elbv2.CfnTargetGroup(this, 'AlbTargetGroupCDK', { 
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
      targets: [{ id: AppLoadBalancer.loadBalancerArn, port: 80 }],
      name: 'cfnCDKAlbTargetGroup', 
    });

    new elbv2.CfnListener(this, 'NlbListener', { 
      loadBalancerArn: NetworkLoadBalancer.loadBalancerArn, 
      port: 80, 
      protocol: 'TCP', 
      defaultActions: [{ 
        type: 'forward', 
        targetGroupArn: albTargetGroup.ref, 
      }], 
    });
    
    
    new CfnOutput(this, 'NLBDNSName', { 
      value: NetworkLoadBalancer.loadBalancerDnsName, 
    });
  }
}
git config --global user.email "prajotkulkarni.bgm@gmail.com"
git config --global user.name "prajot"