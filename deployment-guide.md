# AWS Deployment Guide for Afiagate Web App

This guide provides step-by-step instructions for deploying your React web app to various AWS services.

## 🚀 Quick Start Options

### Option 1: AWS Amplify (Recommended for beginners)

1. **Install AWS Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   ```

2. **Initialize Amplify in your project**
   ```bash
   amplify init
   ```

3. **Deploy to Amplify**
   ```bash
   amplify publish
   ```

### Option 2: AWS S3 + CloudFront (Cost-effective)

1. **Install AWS CLI**
   ```bash
   # Ubuntu/Debian
   sudo apt install awscli
   
   # macOS
   brew install awscli
   ```

2. **Configure AWS CLI**
   ```bash
   aws configure
   ```

3. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://your-afiagate-webapp-bucket
   ```

4. **Configure S3 for static website hosting**
   ```bash
   aws s3 website s3://your-afiagate-webapp-bucket --index-document index.html --error-document index.html
   ```

5. **Set bucket policy for public access**
   ```bash
   aws s3api put-bucket-policy --bucket your-afiagate-webapp-bucket --policy '{
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-afiagate-webapp-bucket/*"
       }
     ]
   }'
   ```

6. **Deploy using the script**
   ```bash
   chmod +x deploy-s3.sh
   ./deploy-s3.sh
   ```

### Option 3: Docker on AWS ECS/EC2

1. **Build and push Docker image**
   ```bash
   docker build -t afiagate-webapp .
   docker tag afiagate-webapp:latest your-account.dkr.ecr.region.amazonaws.com/afiagate-webapp:latest
   docker push your-account.dkr.ecr.region.amazonaws.com/afiagate-webapp:latest
   ```

2. **Deploy to ECS or EC2**

## 📋 Prerequisites

### Required Tools
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [AWS CLI](https://aws.amazon.com/cli/)
- [Docker](https://www.docker.com/) (for containerized deployment)

### AWS Account Setup
1. Create an AWS account
2. Create an IAM user with appropriate permissions
3. Configure AWS CLI with your credentials

## 🔧 Environment Configuration

### Production Environment Variables
Create a `.env.production` file:
```env
REACT_APP_API_URL=https://your-backend-api.com
REACT_APP_ENVIRONMENT=production
```

### AWS Environment Variables
Set these in your AWS service:
- `REACT_APP_API_URL`: Your backend API URL
- `REACT_APP_ENVIRONMENT`: production

## 🏗️ Build Process

### Local Build Test
```bash
npm run build
```

### Production Build
```bash
NODE_ENV=production npm run build
```

## 📊 Cost Estimation

### AWS S3 + CloudFront
- S3 Storage: ~$0.023 per GB/month
- CloudFront: ~$0.085 per GB transferred
- **Estimated monthly cost**: $1-5 for typical usage

### AWS Amplify
- Build minutes: $0.01 per minute
- Storage: $0.023 per GB/month
- **Estimated monthly cost**: $1-10 for typical usage

### AWS ECS
- Fargate: ~$0.04048 per vCPU per hour
- **Estimated monthly cost**: $15-30 for 24/7 running

## 🔒 Security Considerations

### S3 Bucket Security
- Enable bucket versioning
- Configure lifecycle policies
- Use CloudTrail for logging
- Enable server-side encryption

### CloudFront Security
- Use HTTPS only
- Configure security headers
- Enable WAF if needed
- Use custom domain with SSL certificate

### Environment Variables
- Never commit sensitive data to version control
- Use AWS Systems Manager Parameter Store for secrets
- Rotate API keys regularly

## 📈 Monitoring and Logging

### CloudWatch Setup
```bash
# Create log group
aws logs create-log-group --log-group-name /aws/afiagate-webapp

# Set retention policy
aws logs put-retention-policy --log-group-name /aws/afiagate-webapp --retention-in-days 30
```

### Health Checks
- Configure health check endpoints
- Set up CloudWatch alarms
- Monitor error rates and response times

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: aws s3 sync build/ s3://your-bucket-name --delete
      - run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Deployment Issues**
   - Verify AWS credentials
   - Check S3 bucket permissions
   - Ensure CloudFront distribution is configured correctly

3. **Runtime Errors**
   - Check environment variables
   - Verify API endpoints are accessible
   - Review browser console for errors

### Debug Commands
```bash
# Check AWS CLI configuration
aws sts get-caller-identity

# Test S3 access
aws s3 ls s3://your-bucket-name

# Check CloudFront distribution
aws cloudfront get-distribution --id your-distribution-id
```

## 📞 Support

For deployment issues:
1. Check AWS documentation
2. Review CloudWatch logs
3. Contact AWS support if needed
4. Check the project's GitHub issues

## 🔗 Useful Links

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
