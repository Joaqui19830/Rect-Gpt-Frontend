import { useState } from "react";
import { orthographyUseCase } from "../../../core/use-cases";
import {
  GptMessages,
  GptOrthographyMessage,
  MyMessage,
  TextMessageBox,
  TypingLoader,
} from "../../components";

interface Message {
  text: string;
  isGpt: boolean;
  info?: {
    userScore: number;
    errors: string[];
    message: string;
  };
}

export default function OrthographyPage() {
  const [isloading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handlePost = async (text: string) => {
    setIsLoading(true);
    setMessages((prev) => [...prev, { text: text, isGpt: false }]);

    // Usecase
    const { ok, message, errors, userScore } = await orthographyUseCase(text);
    // console.log(data);

    if (!ok) {
      setMessages((prev) => [
        ...prev,
        { text: "No se pudo realizar la correción", isGpt: true },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          text: message,
          isGpt: true,
          info: {
            errors,
            message,
            userScore,
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
          <GptMessages text="Hola, puedes escribir tu texto en español y yo te ayudo con las correcciones" />

          {messages.map((message, index) =>
            message.isGpt ? (
              // <GptMessages key={index} text="Esto es de OpenIA" />
              <GptOrthographyMessage
                key={index}
                {...message.info!}
                // errors={message.info!.errors}
                // message={message.info!.message}
                // userScore={message.info!.userScore}
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
      {/* <TextMessageBoxFile
        onSendMessage={handlePost}
        placeholder="Escribe aqui lo que deseas"
      /> */}

      {/* <TextMessageBoxSelect
        onSendMessage={console.log}
        options={[
          { id: "1", text: "Hola" },
          { id: "2", text: "Mundo" },
        ]}
      /> */}
    </div>
  );
}
