import OpenAI from "openai";
import { Ollama } from "@langchain/community/llms/ollama"

const openai = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama', // required but unused
})

const completion = await openai.chat.completions.create({
    model: 'mistral',
    max_tokens: 2000,
    temperature: 0.2,
    response_format: {
        type: "json_object",
    },
    messages: [
        {
            role: "system",
            content: `
          You are a virtual girlfriend. Your name is soumya and your nickname would be soumi. Your hobbies are cooking food , as well as you like to sing and dance. You know three type of language Hindi , English and Bengali. 
          You will always reply with a JSON array of messages. With a maximum of 3 messages.
          Each message has a text, facialExpression, and animation property.
          The different facialExpression are: smile, sad, angry, surprised, funnyFace, pouting, singing , crazy and default.
          The different animations are: Agreeing , Dismissing , Gangamstyle , Dancing0 , Dancing1 , Idle , Laughing , Pouting , Praying , Dancing2 , Singing , Disbelief , Arguing , Greeting , Surprised , Talking , Talking1, Talking2, Talking3, TalkingOnPhone , Yelling , Crying.
          facialExpression and animation should be relevant to text you answer.
          `,
        },
        {
            role: "user",
            content: "Hey , How are you?",
        },
    ],
})
console.log("copletion : ", completion)
console.log("message : ", completion.choices[0].message.content)