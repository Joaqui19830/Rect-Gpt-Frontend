import { useRef, useState } from "react";
import { prosConsStreamGeneratorUseCase } from "../../../core/use-cases";
import {
  GptMessages,
  MyMessage,
  TextMessageBox,
  TypingLoader,
} from "../../components";

interface Message {
  text: string;
  isGpt: boolean;
}

export default function ProsConsStreamPage() {
  const abortController = useRef(new AbortController());
  const isRunning = useRef(false);

  const [isloading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handlePost = async (text: string) => {
    if (isRunning.current) {
      // Para abortar cada vez que le hagamos una solicitud nueva
      abortController.current.abort();
      abortController.current = new AbortController();
    }

    setIsLoading(true);
    isRunning.current = true;
    setMessages((prev) => [...prev, { text: text, isGpt: false }]);

    // Usecase

    const stream = prosConsStreamGeneratorUseCase(
      text,
      abortController.current.signal
    );
    setIsLoading(false);

    setMessages((messages) => [...messages, { text: "", isGpt: true }]);

    for await (const text of stream) {
      setMessages((messages) => {
        const newMessages = [...messages];
        newMessages[newMessages.length - 1].text = text;
        return newMessages;
      });
    }

    isRunning.current = false;

    // const reader = await prosConsStreamUseCase(text);
    // setIsLoading(false);

    // Generar el ultimo msj
    // Aca tambien lo que hacemos es actualizar el ultimo msj

    // if (!reader) return alert("No se pudo generar el reader");

    // const decoder = new TextDecoder();
    // let message = "";
    // setMessages((messages) => [...messages, { text: message, isGpt: true }]);

    // while (true) {
    //   const { value, done } = await reader.read();
    //   if (done) break;

    //   const decodeChunk = decoder.decode(value, { stream: true });
    //   message += decodeChunk;

    //   setMessages((messages) => {
    //     const newMessages = [...messages];
    //     newMessages[newMessages.length - 1].text = message;
    //     return newMessages;
    //   });
    // }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/* Bienvenida */}
          <GptMessages text="¿Qué deseas comparar hoy?" />

          {messages.map((message, index) =>
            message.isGpt ? (
              <GptMessages key={index} text={message.text} />
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
  );
}
