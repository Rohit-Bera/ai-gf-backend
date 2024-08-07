import { StreamData, StreamingTextResponse, streamText, streamToResponse } from "ai";
import { Ollama } from "@langchain/community/llms/ollama";
import OpenAI from "openai";

// const ollama = new Ollama({
//   baseURL: "http://localhost:11434/v1",
//   apiKey: "ollama", // required but unused
// });

const result = await streamText({
    model: 'tyllama/kevin',
    maxTokens: 2000,
    temperature: 0.2,
    headers: 'http://localhost:11434/v1',
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
      content: "what is your name ? , can you introduce yourself?",
    },
  ],
})

for await (const chat of result.textStream){
    console.log('textPart :',chat)
}