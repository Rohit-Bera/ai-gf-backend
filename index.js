import { exec } from "child_process";
import cors from "cors";
import dotenv from "dotenv";
import voice from "elevenlabs-node";
import express, { text } from "express";
import { promises as fs } from "fs";
import OpenAI from "openai";
import Mp32Wav from "mp3-to-wav";
import gTTS from "gtts";

dotenv.config();
// const apiKEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama", // required but unused
});

// const elevenLabsApiKey = process.env.ELEVEN_LABS_API_KEY;
// const voiceID = "kgG7dCoKCfLehAPWkJOE";

const app = express();
app.use(express.json());
app.use(cors());
const port = 3000;

app.get("/", (req, res) => {
  res.send("Server is Running!!!");
});

app.get("/voices", async (req, res) => {
  res.send(await voice.getVoices(elevenLabsApiKey));
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

  // alternate to convert mp3 to wav
  new Mp32Wav(`audios/message_${message}.mp3`, "audios").exec();

  console.log(`Conversion done in ${new Date().getTime() - time}ms`);
  await execCommand(
    `./bin/rhubarb -f json -o audios/message_${message}.json audios/message_${message}.wav -r phonetic`
  );

  console.log(`Lip sync done in ${new Date().getTime() - time}ms`);
};

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    res.send({
      messages: [
        {
          text: "Hey dear... How was your day?",
          audio: await audioFileToBase64("audios/intro_0.wav"),
          lipsync: await readJsonTranscript("audios/intro_0.json"),
          facialExpression: "smile",
          animation: "Talking1",
        },
        {
          text: "I missed you so much... Please don't go for so long!",
          audio: await audioFileToBase64("audios/intro_1.wav"),
          lipsync: await readJsonTranscript("audios/intro_1.json"),
          facialExpression: "sad",
          animation: "Crying",
        },
      ],
    });
    return;
  }

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
        content: userMessage || "Hello",
      },
    ],
  });

  console.log("✌️completion --->", completion);
  let messages = JSON.parse(completion.choices[0].message.content);
  console.log("✌️messages --->", messages);
  if (messages.messages) {
    messages = messages.messages; // ChatGPT is not 100% reliable, sometimes it directly returns an array and sometimes a JSON object with a messages property
  }
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    // generate audio file
    const fileName = `audios/message_${i}.mp3`; // The name of your audio file
    const textInput = message.text; // The text you wish to convert to speech
    
    // this code will convert speech to 
    const gtts = new gTTS(textInput);
    gtts.save(`audios/message_${i}.mp3`, function (err, result) {
      if (err) {
        console.log("something went wrong in mp3 conversion");
        throw new Error(err);
      }
    });
    // generate lipsync
    await lipSyncMessage(i);
    message.audio = await audioFileToBase64(fileName);
    message.lipsync = await readJsonTranscript(`audios/message_${i}.json`);
  }

  res.send({ messages });
});

const readJsonTranscript = async (file) => {
  const data = await fs.readFile(file, "utf8");
  return JSON.parse(data);
};

const audioFileToBase64 = async (file) => {
  const data = await fs.readFile(file);
  return data.toString("base64");
};

app.listen(port, () => {
  console.log(`Virtual Girlfriend listening on port ${port}`);
});
