import { getAvailableVoices } from "./textToSpeech";
const findVoice = (voices, langCodes) => {
  return (
    voices.find((voice) =>
      langCodes.some((lang) => voice.lang.toLowerCase() === lang.toLowerCase()),
    ) ||
    voices.find((voice) =>
      langCodes.some((lang) =>
        voice.lang.toLowerCase().startsWith(lang.toLowerCase()),
      ),
    ) ||
    null
  );
};

export const getEnglishVoices = () => {
  const voices = getAvailableVoices();

  return {
    uk: findVoice(voices, ["en-GB"]),
    us: findVoice(voices, ["en-US"]),
  };
};
