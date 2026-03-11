import { config } from "dotenv";
config();

function required(key) {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(
      `[envConfig] Missing required environment variable: ${key}`,
    );
  }
  return value;
}

function optional(key, defaultValue = undefined) {
  return process.env[key] ?? defaultValue;
}

export const envConfig = {
  get port() {
    return parseInt(optional("PORT", "4000"), 10);
  },
  get nodeEnv() {
    return optional("NODE_ENV", "development");
  },
  get isProduction() {
    return this.nodeEnv === "production";
  },
  get isDevelopment() {
    return this.nodeEnv === "development";
  },

  get dbUri() {
    const uri = optional("DB_URI") || optional("MONGODB_URI");
    if (!uri)
      throw new Error(
        "[envConfig] Missing required environment variable: DB_URI",
      );
    return uri;
  },

  get jwtSecret() {
    return required("JWT_SECRET");
  },

  get corsOrigin() {
    return required("CORS_ORIGIN");
  },

  get mailtrap() {
    return {
      apiKey: required("MAILTRAP_API_KEY"),
      fromEmail: required("MAILTRAP_FROM_EMAIL"),
      fromName: required("MAILTRAP_FROM_NAME"),
      user: required("MAILTRAP_USER"),
      pass: required("MAILTRAP_PASS"),
      port: parseInt(required("MAILTRAP_PORT"), 10),
      host: required("MAILTRAP_HOST"),
    };
  },

  get awsRegion() {
    return optional("AWS_REGION", "us-east-1");
  },
  get localstackEndpoint() {
    return optional("LOCALSTACK_ENDPOINT");
  },

  get lambdaJobProcessorArn() {
    return optional(
      "LAMBDA_JOB_PROCESSOR_ARN",
      "arn:aws:lambda:us-east-1:000000000000:function:crm-job-processor",
    );
  },
  get eventbridgeRoleArn() {
    return optional(
      "EVENTBRIDGE_ROLE_ARN",
      "arn:aws:iam::000000000000:role/eventbridge-lambda-role",
    );
  },

  get redis() {
    return {
      url: required("UPSTASH_REDIS_REST_URL"),
      token: required("UPSTASH_REDIS_REST_TOKEN"),
    };
  },

  get apiBaseUrl() {
    return optional("API_BASE_URL", "http://localhost:4000/api");
  },

  get nioleadsApiKey() {
    return optional("NIOLEADS_API_KEY");
  },
};

export default envConfig;
