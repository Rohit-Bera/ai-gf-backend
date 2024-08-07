import OpenAI from "openai";
import { Ollama } from "@langchain/community/llms/ollama";
import gTTS from "gtts";

const openai = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama", // required but unused
});

// node-llama-cpp

const completion = await openai.chat.completions.create({
  model: "tyllama/kevin",
// model: 'gdisney/orca2-uncensored',
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
      content: "Hello can you introduce urself.",
    },
  ],
});
console.log("copletion : ", completion);
console.log("message : ", completion.choices[0].message.content);

// const { messages } = completion.choices[0].message.content;

let messages = JSON.parse(completion.choices[0].message.content);

if (messages.messages) {
  messages = messages.messages;
}

console.log('messages :',messages)

messages.map((item , key) => {
    console.log('key : ',key)
  console.log("text speech :", item.text);

  const gtts = new gTTS(item.text);
  gtts.save(`./test_audio/Voice_${key}.mp3`, function (err, result) {
    if (err) {
      throw new Error(err);
    }
  });
});
