import { NextResponse } from 'next/server';
import { ResembleTTS, AudioPrecision } from '@/app/api/backend/tts';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Types for request body
interface GenerateAudioRequest {
  text: string;
  sampleRate: string;
  precision?: AudioPrecision;
}

const validateRequestBody = (body: unknown): body is GenerateAudioRequest => {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  if (!('text' in body) || typeof body.text !== 'string' || body.text.length < 1) {
    return false;
  }

  if (!('sampleRate' in body) || typeof body.sampleRate !== 'string') {
    return false;
  }

  if ('precision' in body && typeof body.precision !== 'string') {
    return false;
  }

  return true;
};

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate request body
    if (!validateRequestBody(body)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Initialize TTS service
    const tts = new ResembleTTS();
    if (!process.env.RESEMBLE_VOICE_UUID || !process.env.RESEMBLE_PROJECT_UUID) {
      return NextResponse.json(
        { error: 'Missing Resemble AI configuration' },
        { status: 500 }
      );
    }

    // Create audio stream
    const audioStream = tts.streamSynthesize(body.text, {
      voiceUuid: process.env.RESEMBLE_VOICE_UUID!,
      projectUuid: process.env.RESEMBLE_PROJECT_UUID!,
      sampleRate: body.sampleRate ? (parseInt(body.sampleRate) as 8000 | 16000 | 22050 | 44100 | 32000) : undefined,
      precision: body.precision,
    });

    // Create readable stream for response
    const readableStream = ResembleTTS.createReadableStream(audioStream);

    // Return streaming response
    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'audio/wav',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
}