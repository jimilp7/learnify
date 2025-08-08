import { NextResponse } from 'next/server';
import { ResembleTTS, AudioPrecision, StreamingChunk } from '@/app/api/backend/tts';

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
  const startTime = Date.now()
  let requestId: string | undefined

  try {
    // Generate unique request ID for tracking
    requestId = `audio_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    console.log(`🎤 [${requestId}] Starting audio generation request`)

    // Parse request body with timeout
    const parsePromise = req.json()
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request parsing timeout')), 10000)
    })
    
    const body = await Promise.race([parsePromise, timeoutPromise])
    console.log(`📝 [${requestId}] Request body parsed, text length: ${(body as GenerateAudioRequest)?.text?.length || 0}`)

    // Validate request body
    if (!validateRequestBody(body)) {
      console.error(`❌ [${requestId}] Invalid request body:`, body)
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          details: 'Missing required fields: text (string), sampleRate (string)',
          requestId 
        },
        { status: 400 }
      );
    }

    // Validate text length (prevent excessive requests)
    if (body.text.length > 10000) {
      console.error(`❌ [${requestId}] Text too long: ${body.text.length} characters`)
      return NextResponse.json(
        { 
          error: 'Text too long',
          details: 'Maximum text length is 10,000 characters',
          requestId 
        },
        { status: 400 }
      );
    }

    // Check environment configuration
    if (!process.env.RESEMBLE_VOICE_UUID || !process.env.RESEMBLE_PROJECT_UUID) {
      console.error(`❌ [${requestId}] Missing Resemble AI configuration`)
      return NextResponse.json(
        { 
          error: 'Audio service temporarily unavailable',
          details: 'Server configuration error',
          requestId,
          retryable: false
        },
        { status: 503 }
      );
    }

    // Initialize TTS service with error handling
    let tts: ResembleTTS
    try {
      tts = new ResembleTTS()
      console.log(`🔧 [${requestId}] TTS service initialized`)
    } catch (initError) {
      console.error(`❌ [${requestId}] TTS service initialization failed:`, initError)
      return NextResponse.json(
        { 
          error: 'Audio service initialization failed',
          details: 'Unable to initialize text-to-speech service',
          requestId,
          retryable: true
        },
        { status: 503 }
      );
    }

    // Validate sample rate
    const validSampleRates = ['8000', '16000', '22050', '32000', '44100']
    if (!validSampleRates.includes(body.sampleRate)) {
      console.error(`❌ [${requestId}] Invalid sample rate: ${body.sampleRate}`)
      return NextResponse.json(
        { 
          error: 'Invalid sample rate',
          details: `Sample rate must be one of: ${validSampleRates.join(', ')}`,
          requestId
        },
        { status: 400 }
      );
    }

    console.log(`🎵 [${requestId}] Starting TTS synthesis...`)
    const synthStartTime = Date.now()

    // Create audio stream with timeout wrapper
    let audioStream: AsyncIterable<StreamingChunk>
    try {
      audioStream = tts.streamSynthesize(body.text, {
        voiceUuid: process.env.RESEMBLE_VOICE_UUID!,
        projectUuid: process.env.RESEMBLE_PROJECT_UUID!,
        sampleRate: parseInt(body.sampleRate) as 8000 | 16000 | 22050 | 44100 | 32000,
        precision: body.precision,
      });
      
      console.log(`✅ [${requestId}] TTS synthesis started (${Date.now() - synthStartTime}ms)`)
    } catch (ttsError) {
      console.error(`❌ [${requestId}] TTS synthesis failed:`, ttsError)
      
      // Determine if error is retryable
      const isRetryable = ttsError instanceof Error && 
        (ttsError.message.includes('timeout') || 
         ttsError.message.includes('network') ||
         ttsError.message.includes('rate limit'))

      return NextResponse.json(
        { 
          error: 'Audio generation failed',
          details: ttsError instanceof Error ? ttsError.message : 'Unknown TTS error',
          requestId,
          retryable: isRetryable
        },
        { status: 503 }
      );
    }

    // Create readable stream for response with error handling
    let readableStream: ReadableStream<Uint8Array>
    try {
      readableStream = ResembleTTS.createReadableStream(audioStream as AsyncGenerator<StreamingChunk, void, unknown>)
      console.log(`🌊 [${requestId}] Readable stream created`)
    } catch (streamError) {
      console.error(`❌ [${requestId}] Stream creation failed:`, streamError)
      return NextResponse.json(
        { 
          error: 'Audio stream creation failed',
          details: 'Unable to create audio response stream',
          requestId,
          retryable: true
        },
        { status: 503 }
      );
    }

    const totalTime = Date.now() - startTime
    console.log(`✅ [${requestId}] Audio generation completed successfully (${totalTime}ms total)`)

    // Return streaming response
    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'audio/wav',
        'Transfer-Encoding': 'chunked',
        'X-Request-Id': requestId,
        'X-Generation-Time': totalTime.toString(),
      },
    });

  } catch (error) {
    const totalTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error(`💥 [${requestId}] Unexpected audio generation error (${totalTime}ms):`, {
      message: errorMessage,
      stack: errorStack,
      requestId
    })

    // Determine error type and appropriate status code
    let statusCode = 500
    let userMessage = 'Audio generation failed unexpectedly'
    let retryable = true

    if (errorMessage.includes('timeout')) {
      statusCode = 504
      userMessage = 'Audio generation timed out'
      retryable = true
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      statusCode = 503
      userMessage = 'Network error during audio generation'
      retryable = true
    } else if (errorMessage.includes('parse') || errorMessage.includes('JSON')) {
      statusCode = 400
      userMessage = 'Invalid request format'
      retryable = false
    } else if (errorMessage.includes('authorization') || errorMessage.includes('auth')) {
      statusCode = 503
      userMessage = 'Audio service temporarily unavailable'
      retryable = false
    }

    return NextResponse.json(
      { 
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : 'Internal server error',
        requestId: requestId || 'unknown',
        retryable,
        duration: totalTime
      },
      { status: statusCode }
    );
  }
}