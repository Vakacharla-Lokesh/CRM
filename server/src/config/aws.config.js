export const awsConfig = {
  region: process.env.AWS_REGION || "us-east-1",
  sqsQueueUrl: process.env.SQS_QUEUE_URL || null,
  eventBridgeRuleName:
    process.env.EVENTBRIDGE_RULE_NAME || "crm-lead-reminder-schedule",
  lambdaFunctionName: process.env.LAMBDA_FUNCTION_NAME || "crm-job-processor",
};

export default awsConfig;
