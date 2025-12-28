import { voiceService } from './src/services/voice-service';
import fs from 'fs';
import path from 'path';

// Note: This test expects a 'test.m4a' or similar audio file in the root if you want to run it against a real file.
// Or we can mock it?
// For now, I will create a dummy file just to see if it instantiates. But Groq will fail if not a real audio file.
// So I will just check if `voiceService` is defined and has the method.

async function testVoiceService() {
    console.log('Testing VoiceService...');
    if (!process.env.GROQ_API_KEY) {
        console.warn('⚠️ GROQ_API_KEY is not set. Skipping real API call.');
        return;
    }

    try {
        if (voiceService && typeof voiceService.transcribeAudio === 'function') {
            console.log('✅ VoiceService instantiated successfully.');
        } else {
            console.error('❌ VoiceService failed to instantiate.');
        }

        // Optional: If you have a file 'test_audio.m4a', uncomment to test.
        // const filePath = path.join(__dirname, 'test_audio.m4a');
        // if (fs.existsSync(filePath)) {
        //     const result = await voiceService.transcribeAudio(filePath);
        //     console.log('Transcription result:', result);
        // } else {
        //     console.log('ℹ️ No test_audio.m4a found. Skipping API call.');
        // }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testVoiceService();
