import { Resemble } from '@resemble/node';
import dotenv from 'dotenv';
import path from 'path';


// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Types from Resemble SDK
export type AudioPrecision = 'MULAW' | 'PCM_16' | 'PCM_32';
export type AudioFormat = 'wav' | 'mp3';

export interface StreamingChunk {
  data: Uint8Array;
  timeToFirstSound?: number;
}

export class ResembleTTS {
  private static MIN_CHUNK_SIZE = 4096 * 12;

  constructor(apiKey?: string, endpoint?: string) {
    const key = apiKey || process.env.RESEMBLE_AI_API_KEY;
    const streamingEndpoint = endpoint || process.env.RESEMBLE_STREAM_ENDPOINT
    if (!key) {
      throw new Error('Resemble AI API key is required');
    }

    // Initialize Resemble SDK
    Resemble.setApiKey(key);
    if (streamingEndpoint) {
      Resemble.setSynthesisUrl(streamingEndpoint);
    }
  }

  /**
   * Stream audio synthesis using Resemble SDK
   */
  public async *streamSynthesize(text: string, options: {
    voiceUuid: string;
    projectUuid: string;
    sampleRate?: 8000 | 16000 | 22050 | 44100 | 32000;
    precision?: AudioPrecision;
    streaming?: {
      bufferSize?: number;
      ignoreWavHeader?: boolean;
    };
  }): AsyncGenerator<StreamingChunk, void, unknown> {
    let startTime = performance.now();
    let isFirstChunk = true;

    try {
      for await (const out of Resemble.v2.clips.stream(
        {
          data: text,
          voice_uuid: options.voiceUuid,
          project_uuid: options.projectUuid,
          sample_rate: options.sampleRate || 22050,
          precision: options.precision || 'PCM_16'
        },
        {
          bufferSize: options.streaming?.bufferSize || ResembleTTS.MIN_CHUNK_SIZE,
          ignoreWavHeader: options.streaming?.ignoreWavHeader || false
        }
      )) {
        const { data: chunk } = out as { data: Uint8Array };
        
        if (chunk) {
          if (isFirstChunk) {
            const timeToFirstSound = performance.now() - startTime;
            isFirstChunk = false;
            yield { data: chunk, timeToFirstSound };
          } else {
            yield { data: chunk };
          }
        }
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Streaming synthesis failed');
    }
  }

  /**
   * Create a ReadableStream from a streaming response
   */
  static createReadableStream(
    iterator: AsyncGenerator<StreamingChunk, void, unknown>
  ): ReadableStream<Uint8Array> {
    return new ReadableStream({
      async pull(controller) {
        const { value, done } = await iterator.next();
        
        if (done) {
          controller.close();
        } else if (value) {
          controller.enqueue(value.data);
        }
      }
    });
  }
}