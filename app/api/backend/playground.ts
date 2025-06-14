import { TTSTestUtils } from "./ttsTest";
import dotenv from 'dotenv';
import path from 'path';


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
      console.log(`Streaming audio saved to: ${streamingPath}`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      // Optional: clean up test files
      // ttsTest.cleanup();
    }
  }

test().catch(error => {
    console.error('Failed to run test:', error);
    process.exit(1);
});
