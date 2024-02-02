import { useState } from "react";
import {
  imageGenerationUseCase,
  imageVariationUseCase,
} from "../../../core/use-cases";
import {
  GptMessages,
  GptMessagesSeletableImage,
  MyMessage,
  TextMessageBox,
  TypingLoader,
} from "../../components";

interface Message {
  text: string;
  isGpt: boolean;
  info?: {
    imageUrl: string;
    alt: string;
  };
}

export default function ImageTunningPage() {
  const [isloading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      isGpt: true,
      text: "Imagen Base",
      info: {
        alt: "Imagen Base",
        imageUrl:
          "http://localhost:3000/gpt/image-generation/1706912648910.png",
      },
    },
  ]);

  const [originalImageAndMask, setOriginalImageAndMask] = useState({
    original: undefined as string | undefined,
    mask: undefined as string | undefined,
  });

  const handleVariation = async () => {
    setIsLoading(true);
    const resp = await imageVariationUseCase(originalImageAndMask.original!);
    setIsLoading(false);
    if (!resp) return;
    setMessages((prev) => [
      ...prev,
      {
        text: "Variacion",
        isGpt: true,
        info: {
          imageUrl: resp.url,
          alt: resp.alt,
        },
      },
    ]);
  };

  const handlePost = async (text: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { text: text, isGpt: false }]);

    const { original, mask } = originalImageAndMask;

    // Usecase
    const imageInfo = await imageGenerationUseCase(text, original, mask);
    setIsLoading(false);

    if (!imageInfo) {
      return setMessages((prev) => [
        ...prev,
        { text: "No se pudo generar la imagen", isGpt: true },
      ]);
    }

    setMessages((prev) => [
      ...prev,
      {
        text: text,
        isGpt: true,
        info: {
          imageUrl: imageInfo.url,
          alt: imageInfo.alt,
        },
      },
    ]);
  };

  return (
    <>
      {originalImageAndMask.original && (
        <div className="fixed flex flex-col items-center top-10 right-10 z-10 fade-in">
          <span>Editando</span>
          <img
            // Esto es si tenemos una imagen original mostrala sino mostra la del cuadro flotante
            // Esto es para no tener que estar modificando na o la otra
            src={originalImageAndMask.mask ?? originalImageAndMask.original}
            alt="Imagen original"
            className="border rounded-xl w-36 h-36 object-contain"
          />
          <button onClick={handleVariation} className="btn-primary mt-2">
            Generar variación
          </button>
        </div>
      )}

      <div className="chat-container">
        <div className="chat-messages">
          <div className="grid grid-cols-12 gap-y-2">
            {/* Bienvenida */}
            <GptMessages text="¿Qué imagen deseas generar hoy?" />

            {messages.map((message, index) =>
              message.isGpt ? (
                // <GptMessagesImage
                <GptMessagesSeletableImage
                  key={index}
                  text={message.text}
                  imageUrl={message.info?.imageUrl!}
                  alt={message.info?.alt!}
                  onImageSelected={(maskImageUrl) =>
                    setOriginalImageAndMask({
                      original: message.info?.imageUrl,
                      mask: maskImageUrl,
                    })
                  }
                />
              ) : (
                <MyMessage key={index} text={message.text} />
              )
            )}

            {isloading && (
              <div className="col-start-1 col-end-12 fade-in">
                <TypingLoader />
              </div>
            )}
          </div>
        </div>

        <TextMessageBox
          onSendMessage={handlePost}
          placeholder="Escribe aqui lo que deseas"
          disableCorrections
        />
      </div>
    </>
  );
}
