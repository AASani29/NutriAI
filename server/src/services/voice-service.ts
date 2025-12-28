import fs from 'fs';
import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export interface VoiceResult {
    text: string;
    language?: string;
    duration?: number;
}

export class VoiceService {
    async transcribeAudio(filePath: string): Promise<VoiceResult> {
        try {
            console.log('🎤 [VoiceService] Transcribing audio:', filePath);

            if (!process.env.GROQ_API_KEY) {
                throw new Error('Groq API key not configured');
            }

            const transcription = await groq.audio.transcriptions.create({
                file: fs.createReadStream(filePath),
                model: 'whisper-large-v3-turbo',
                response_format: 'verbose_json',
            }) as any;

            const result: VoiceResult = {
                text: transcription.text,
                language: transcription.language,
                duration: transcription.duration,
            };

            console.log('✅ [VoiceService] Transcription complete:', result.text.substring(0, 50) + '...');
            return result;

        } catch (error: any) {
            console.error('❌ [VoiceService] Transcription failed:', error);
            throw new Error(`Voice transcription failed: ${error.message}`);
        }
    }
}

export const voiceService = new VoiceService();
