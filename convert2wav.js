// this code will basically ocnvert mp3 to wav file
// code to convert mp3 file to wav file
import Mp32Wav from "mp3-to-wav";

const convert = () => {
    try {
        
        new Mp32Wav('./audios/api_0.mp3','./test_wav').exec();

    } catch (error) {
        console.log("error : ",error);
    }
}

convert();