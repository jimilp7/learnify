import fs from 'fs';
import path from 'path';
import { ResembleTTS } from './tts';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export class TTSTestUtils {
  private tts: ResembleTTS;
  private outputDir: string;

  constructor(apiKey?: string) {
    const apiKey_ = process.env.RESEMBLE_AI_API_KEY;
    const endpoint = process.env.RESEMBLE_STREAM_ENDPOINT || 'https://p.cluster.resemble.ai/stream';
    this.tts = new ResembleTTS(apiKey_, endpoint);
    this.outputDir = path.join(__dirname, 'test-output');
    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir);
    }
  }

  /**
   * Save audio using streaming synthesis
   */
  async saveAudioStreaming(
    text: string,
    voiceUuid: string,
    filename: string = 'output.wav'
  ): Promise<string> {
    const streamingResult = await this.tts.streamSynthesize(text, {
      voiceUuid,
      projectUuid: process.env.RESEMBLE_PROJECT_UUID || '',
      streaming: {
        bufferSize: 4096 * 12
      }
    });

    const outputPath = path.join(this.outputDir, filename);
    const writeStream = fs.createWriteStream(outputPath);
    
    try {
      for await (const chunk of streamingResult) {
        writeStream.write(chunk.data);
      }
      await new Promise(resolve => writeStream.end(resolve));
      return outputPath;
    } catch (error) {
      writeStream.end();
      throw error;
    }
  }

  /**
   * Clean up test output directory
   */
  cleanup(): void {
    if (fs.existsSync(this.outputDir)) {
      fs.readdirSync(this.outputDir).forEach(file => {
        fs.unlinkSync(path.join(this.outputDir, file));
      });
      fs.rmdirSync(this.outputDir);
    }
  }
}
