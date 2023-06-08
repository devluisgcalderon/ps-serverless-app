import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';

interface WebAppProps {
    hostingBucket: s3.IBucket;
}

export class WebApp extends Construct {
    public readonly webDistribution: cloudfront.CloudFrontWebDistribution;

    constructor(scope: Construct, id: string, props: WebAppProps){
        super(scope, id);

        const oai = new cloudfront.OriginAccessIdentity(this, 'WebHostingOAI', {});

        const cloudfrontProps: any = {
            originConfigs: [
                {
                    s3OriginSource:{
                        s3BucketSource: props.hostingBucket,
                        originAccessIdentity: oai,
                    },
                    behaviors: [{ isDefaultBehavior: true}],
                },
            ],
            errorConfiguration: [
                {
                    errorCachingMinTtl: 86400,
                    errorCode: 403,
                    responseCode: 200,
                    responsePagePath: '/index.html',
                },
                {
                    errorCachingMinTtl: 86400,
                    errorCode: 404,
                    responseCode: 200,
                    responsePagePath: '/index.html',
                },
            ],
        };

        this.webDistribution = new cloudfront.CloudFrontWebDistribution(
            this,
            'AppHostingDistribution',
            cloudfrontProps,
        );

        props.hostingBucket.grantRead(oai);
    }
}