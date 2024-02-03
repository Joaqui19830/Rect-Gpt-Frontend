import { useEffect, useState } from "react";
import {
  creteThreadUseCase,
  postQuestionUseCase,
} from "../../../core/use-cases";
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

export default function AssistantPage() {
  const [isloading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const [threadId, setThreadId] = useState<string>();

  // Obtener el thread, y si no existe crearlo
  useEffect(() => {
    const threadId = localStorage.getItem("threadId");
    if (threadId) {
      setThreadId(threadId);
    } else {
      creteThreadUseCase().then((id) => {
        setThreadId(id);
        localStorage.setItem("threadId", id);
      });
    }
  }, []);

  useEffect(() => {
    if (threadId) {
      setMessages((prev) => [
        ...prev,
        { text: `Numero de thread ${threadId}`, isGpt: true },
      ]);
    }
  }, [threadId]);

  const handlePost = async (text: string) => {
    if (!threadId) return;
    setIsLoading(true);
    setMessages((prev) => [...prev, { text: text, isGpt: false }]);

    // Usecase
    const replies = await postQuestionUseCase(threadId, text);
    setIsLoading(false);

    for (const reply of replies) {
      for (const message of reply.content) {
        setMessages((prev) => [
          ...prev,
          { text: message, isGpt: reply.role === "assistant", info: reply },
        ]);
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <div className="grid grid-cols-12 gap-y-2">
          {/* Bienvenida */}
          <GptMessages text="Buen dia soy Sam, ¿en qué puedo ayudarte?" />

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
