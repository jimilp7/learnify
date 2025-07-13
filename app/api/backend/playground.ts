import { TTSTestUtils } from "./ttsTest";
import dotenv from 'dotenv';
import path from 'path';
import { log } from '@/lib/logger';


dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Example usage
async function test() {
    const ttsTest = new TTSTestUtils();
    
    try {
      // Test streaming synthesis
      const streamingPath = await ttsTest.saveAudioStreaming(
        "Hello, this is a streaming test!",
        process.env.RESEMBLE_VOICE_UUID || '',
        "welcome.wav"
      );
      log.info('Streaming audio saved', { path: streamingPath });
    } catch (error) {
      log.error('Error in TTS test:', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      // Optional: clean up test files
      // ttsTest.cleanup();
    }
  }

test().catch(error => {
    log.error('Failed to run test:', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
});
