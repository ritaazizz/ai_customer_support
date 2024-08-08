import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

const request = {
  prompt: "\n\n Human:Coucou\n\nAssistant:",
  max_tokens_to_sample: 2000,
};
