import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "./aws/awsClient.js";
import { TABLES } from "./aws/initAwsResources.js";
import crypto from "crypto";

export const jobService = {
  async createJob({ tenantId, type, status = "pending" }) {
    const jobId = crypto.randomUUID();
    const now = Date.now();

    // Optional TTL 30 days
    const expiresAt = Math.floor(now / 1000) + 30 * 24 * 60 * 60;

    const params = {
      TableName: TABLES.jobs,
      Item: {
        jobId,
        tenantId: tenantId.toString(),
        type,
        status,
        progress: 0,
        createdAt: now,
        updatedAt: now,
        expiresAt,
      },
    };

    await docClient.send(new PutCommand(params));
    return params.Item;
  },

  async getJob(jobId, tenantId) {
    const params = {
      TableName: TABLES.jobs,
      Key: {
        jobId,
        tenantId: tenantId.toString(),
      },
    };

    const { Item } = await docClient.send(new GetCommand(params));
    return Item;
  },

  async updateJob(jobId, tenantId, updates) {
    const { status, progress, result, error } = updates;
    const now = Date.now();

    let updateExpression = "set updatedAt = :updatedAt";
    const expressionAttributeValues = {
      ":updatedAt": now,
    };
    const expressionAttributeNames = {};

    if (status !== undefined) {
      updateExpression += ", #st = :status";
      expressionAttributeNames["#st"] = "status";
      expressionAttributeValues[":status"] = status;
    }

    if (progress !== undefined) {
      updateExpression += ", progress = :progress";
      expressionAttributeValues[":progress"] = progress;
    }

    if (result !== undefined) {
      updateExpression += ", #res = :result";
      expressionAttributeNames["#res"] = "result";
      expressionAttributeValues[":result"] = result;
    }

    if (error !== undefined) {
      updateExpression += ", #err = :error";
      expressionAttributeNames["#err"] = "error";
      expressionAttributeValues[":error"] = error;
    }

    const params = {
      TableName: TABLES.jobs,
      Key: {
        jobId,
        tenantId: tenantId.toString(),
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    if (Object.keys(expressionAttributeNames).length > 0) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    const { Attributes } = await docClient.send(new UpdateCommand(params));
    return Attributes;
  },
};
