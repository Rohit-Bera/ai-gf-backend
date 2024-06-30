import { HfInference } from '@huggingface/inference'
import dotenv from "dotenv";
dotenv.config();

const HF_ACCESS_TOKEN = process.env.HF_ACCESS_TOKEN;
const hf = new HfInference(HF_ACCESS_TOKEN);

(async () => {
    try {
        const result = await hf.conversational({
            model: 'microsoft/DialoGPT-large',
            inputs: {
              past_user_inputs: ['Which movie is the best ?'],
              generated_responses: ['It is Die Hard for sure.'],
              text: 'Can you explain why ?'
            }
          });
        console.log('✌️result --->', result);
    } catch (error) {
        console.error("Error during conversation:", error);
    }
})();