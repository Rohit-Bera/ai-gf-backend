import dotenv from "dotenv";
import voice from "elevenlabs-node";
dotenv.config();

const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;

const getVoices = async(req , res) => {
    console.log('✌️elevenLabsApiKey --->', elevenLabsApiKey);
    res.send(await voice.getVoices(elevenLabsApiKey));
}

export default {
    getVoices
}