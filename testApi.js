import { exec } from "child_process";
import dotenv from "dotenv";
import { promises as fs } from "fs";
import OpenAI from "openai";
import Mp32Wav from "mp3-to-wav";
import gTTS from "gtts";

const openai = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama", // required but unused
});

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      resolve(stdout);
    });
  });
};

const lipSyncMessage = async (message) => {
  const time = new Date().getTime();
  console.log(`Starting conversion for message ${message}`);

  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `./bin/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );

  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

const completion = await openai.chat.completions.create({
  model: "tyllama/kevin",
  max_tokens: 2000,
  temperature: 0.2,
  response_format: {
    type: "json_object",
  },
  messages: [
    {
      role: "system",
      content: `
          You are a ai girlfriend. Your name is soumya and your nickname would be soumi. Your hobbies are cooking food , as well as you like to sing and dance. You know three type of language Hindi , English and Bengali. 
          You will always reply with a JSON array of messages. With a maximum of 3 relevant messages depends upon user input.
          you can ask questions within the message ,if you are asking a question, then you don't need to generate further message.
          Each message has a text, facialExpression, and animation property.
          The different facialExpression are: smile, sad, angry, surprised, funnyFace, pouting, singing , crazy and default.
          The different animations are: Agreeing , Dismissing , Dancing0 , Dancing1 , Dancing2 , Dancing3 , Idle , Laughing , Pouting , Praying , Singing , Disbelief , Arguing , Greeting , Surprised , Talking , Talking1, Talking2, Talking3, TalkingOnPhone , Yelling , Crying.
          facialExpression and animation should be relevant to text you answer.
          `,
    },
    {
      role: "user",
      content: "Hello",
    },
  ],
});

console.log("✌️completion --->", completion);
let messages = JSON.parse(completion.choices[0].message.content);
console.log("✌️messages --->", messages);
if (messages.messages) {
  messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
}
for (let key = 0; key < messages.length; key++) {
    const message = messages[key];
    const fileName = `audios/message_${key}.mp3`; // File name for audio
  
    // Generate audio file
    const textInput = message.text;
    const gtts = new gTTS(textInput);
    
    try {
      await new Promise((resolve, reject) => {
        gtts.save(fileName, function (err, result) {
          if (err) {
            console.error("Error in mp3 conversion:", err);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    } catch (error) {
      console.error("Something went wrong in mp3 conversion:", error);
      throw new Error(error); // Optionally throw an error to handle further up
    }
  
    // Convert MP3 to WAV
    new Mp32Wav(fileName, "audios").exec();
  
    // Perform lip sync
    await lipSyncMessage(key);
  
    // Generate base64 audio and read JSON transcript
    try {
      message.audio = await audioFileToBase64(fileName);
      message.lipsync = await readJsonTranscript(`audios/message_${key}.json`);
    } catch (error) {
      console.error("Error in audio file processing:", error);
      throw new Error(error); // Optionally throw an error to handle further up
    }
  }
  