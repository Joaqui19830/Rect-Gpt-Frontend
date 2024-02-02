import { AudioToTextResponse } from "../../interfaces";

export const audioToTextUseCase = async (prompt: string, audioFile: File) => {
  try {
    // console.log({ prompt, audioFile });

    const formData = new FormData();
    formData.append("file", audioFile);
    if (prompt) {
      formData.append("prompt", prompt);
    }

    const resp = await fetch(`${import.meta.env.VITE_GPT_API}/audio-to-text`, {
      method: "POST",

      body: formData,
    });

    const data = (await resp.json()) as AudioToTextResponse;

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
