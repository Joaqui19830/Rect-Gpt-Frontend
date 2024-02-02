import { useState } from "react";
import { prosConsDicusserUseCase } from "../../../core/use-cases/pros-cons-dicusser.use-case";
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

export default function ProsConsPage() {
  const [isloading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handlePost = async (text: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { text: text, isGpt: false }]);

    // Usecase
    const { ok, content } = await prosConsDicusserUseCase(text);

    // console.log(data);

    if (!ok) {
      setMessages((prev) => [
        ...prev,
        { text: "No se pudo realizar la respuesta correcta", isGpt: true },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          text: content,
          isGpt: true,
          info: {
            content,
          },
        },
      ]);
    }

    setIsLoading(false);

    // Todo: añadir el mensaje de isGpt en true
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/* Bienvenida */}
          <GptMessages text="Puedes escribir lo que sea que quieras que compare y te de mis puntos de vista" />

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
