import { TTSTestUtils } from "./ttsTest";
import dotenv from 'dotenv';
import path from 'path';
import logger from '@/lib/logger';


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
      logger.info('Streaming audio saved', { streamingPath });
    } catch (error) {
      logger.error('Error in test', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      // Optional: clean up test files
      // ttsTest.cleanup();
    }
  }

test().catch(error => {
    logger.error('Failed to run test', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
});
