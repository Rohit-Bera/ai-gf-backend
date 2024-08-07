// this code will basically generate the mp3 file 
// const speech = new SpeechSynthesisUtterance();

// const respone = speech
import gTTS from "gtts";
	
let speech = 'Welcome to GeeksforGeeks';
const gtts = new gTTS(speech); // ths module is working , but its voice is default an mid-old (30-35).ß

gtts.save('./test_audio/Voice.mp3', function (err, result){
	if(err) { throw new Error(err); }
	console.log("Text to speech converted!");
});

