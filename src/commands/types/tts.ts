export interface requestTTS {
    input: { text: string },
    voice: { languageCode: string, ssmlGender: "SSML_VOICE_GENDER_UNSPECIFIED" | "MALE" | "FEMALE" | "NEUTRAL" | null | undefined },
    audioConfig: { audioEncoding: "MP3" | "AUDIO_ENCODING_UNSPECIFIED" | "LINEAR16" | "OGG_OPUS" | "MULAW" | "ALAW" | null | undefined },
}