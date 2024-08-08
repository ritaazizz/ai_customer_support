import { NextResponse } from 'next/server';
import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime';

const decoder = new TextDecoder();

const bedrockClient = new BedrockRuntimeClient({
  region: 'us-east-1',
});

async function* makeIterator(data) {
  const userQuestion = data.get('userQuestion');

  const command = new InvokeModelWithResponseStreamCommand({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: userQuestion ? userQuestion : 'Please respond in Chinese',
        },
      ],
    }),
  });

  try {
    const response = await bedrockClient.send(command);
    if (response.body) {
      for await (const chunk of response.body) {
        if (chunk.chunk) {
          try {
            const json = JSON.parse(decoder.decode(chunk.chunk.bytes));
            if (json.type === 'content_block_delta') {
              yield json.delta.text;
            }
          } catch (error) {
            console.error(error);
            yield ' ';
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }

  return NextResponse.json({ name: 'Headstarter', route: '/api/aws' });
}

function iteratorToStream(iterator) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

export async function POST(request) {
  const data = await request.formData();
  const iterator = makeIterator(data);
  const stream = iteratorToStream(iterator);
  return new Response(stream);
}
