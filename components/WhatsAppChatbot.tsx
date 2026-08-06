"use client";

import {
  WheelEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  createClient,
} from "@supabase/supabase-js";
import {
  FiMessageCircle,
  FiX,
} from "react-icons/fi";
import ChatHeader from "./chat/ChatHeader";
import ChatInput from "./chat/ChatInput";
import ChatMessages from "./chat/ChatMessages";
import {
  MAX_IMAGE_COUNT,
  prepareImageAttachment,
} from "./chat/image-compression";
import {
  cleanImageGenerationPrompt,
  shouldGenerateImage,
} from "./chat/intent";
import {
  CHAT_STORAGE_KEY,
  FALLBACK_IMAGE,
  INITIAL_MESSAGES,
  LIVE_INFORMATION_PATTERNS,
  MAX_API_CONTEXT_MESSAGES,
  MAX_CONTEXT_MESSAGE_LENGTH,
  SESSION_STORAGE_KEY,
  WHATSAPP_NUMBER,
} from "./chat/constants";
import type {
  ApiConversationMessage,
  AssistantStreamEvent,
  ChatbotSettings,
  ChatMessage,
  ImageChatMessage,
  PendingImageAttachment,
  SignedUploadItem,
  StoredChatMessage,
  TextChatMessage,
  ThinkingMode,
} from "./chat/types";

function createMessageId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function createSessionId() {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 14)}`;
}

function normalizeStoredMessages(
  value: unknown,
): StoredChatMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        item,
      ): item is Record<
        string,
        unknown
      > =>
        Boolean(item) &&
        typeof item ===
          "object",
    )
    .filter(
      (item) =>
        typeof item.id ===
          "string" &&
        typeof item.text ===
          "string" &&
        (
          item.sender ===
            "assistant" ||
          item.sender ===
            "visitor"
        ),
    )
    .map((item) => ({
      id:
        item.id as string,

      kind:
        "text",

      sender:
        item.sender as
          | "assistant"
          | "visitor",

      text:
        item.text as string,

      isStreaming:
        false,
    }));
}

function requiresLiveInformation(
  message: string,
) {
  return LIVE_INFORMATION_PATTERNS.some(
    (pattern) =>
      pattern.test(message),
  );
}

function shortenText(
  text: string,
) {
  const cleanText =
    text.trim();

  if (
    cleanText.length <=
    MAX_CONTEXT_MESSAGE_LENGTH
  ) {
    return cleanText;
  }

  return `${cleanText.slice(
    0,
    MAX_CONTEXT_MESSAGE_LENGTH,
  )}\n\n[Earlier message shortened.]`;
}

function createApiContext(
  messages: ChatMessage[],
  visitorMessage: TextChatMessage,
): ApiConversationMessage[] {
  const history =
    messages
      .filter(
        (
          message,
        ): message is TextChatMessage =>
          message.kind ===
            "text" &&
          !message.isStreaming,
      )
      .filter(
        (message) =>
          message.id !==
          "welcome-message",
      )
      .slice(
        -MAX_API_CONTEXT_MESSAGES,
      )
      .map((message) => ({
        role:
          message.sender ===
          "visitor"
            ? "user" as const
            : "assistant" as const,

        content:
          shortenText(
            message.text,
          ),
      }));

  return [
    ...history,

    {
      role:
        "user",

      content:
        visitorMessage.text,
    },
  ];
}

function parseSseBlock(
  block: string,
) {
  const dataLines =
    block
      .split("\n")
      .filter(
        (line) =>
          line.startsWith(
            "data:",
          ),
      )
      .map(
        (line) =>
          line
            .slice(5)
            .trimStart(),
      );

  if (
    dataLines.length ===
    0
  ) {
    return null;
  }

  try {
    return JSON.parse(
      dataLines.join(""),
    ) as AssistantStreamEvent;
  } catch {
    return null;
  }
}

export default function WhatsAppChatbot() {
  const [
    isOpen,
    setIsOpen,
  ] = useState(false);

  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>(
    INITIAL_MESSAGES,
  );

  const [
    inputValue,
    setInputValue,
  ] = useState("");

  const [
    isBusy,
    setIsBusy,
  ] = useState(false);

  const [
    isWaitingForFirstToken,
    setIsWaitingForFirstToken,
  ] = useState(false);

  const [
    thinkingMode,
    setThinkingMode,
  ] = useState<ThinkingMode>(
    "standard",
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    showQuestions,
    setShowQuestions,
  ] = useState(true);

  const [
    showScrollButton,
    setShowScrollButton,
  ] = useState(false);

  const [
    sessionId,
    setSessionId,
  ] = useState("");

  const [
    profileImage,
    setProfileImage,
  ] = useState(FALLBACK_IMAGE);

  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  const [
    regeneratingMessageId,
    setRegeneratingMessageId,
  ] = useState<string | null>(
    null,
  );

  const [
    pendingImages,
    setPendingImages,
  ] = useState<PendingImageAttachment[]>(
    [],
  );

  const scrollAreaRef =
    useRef<HTMLDivElement>(null);

  const requestControllerRef =
    useRef<AbortController | null>(
      null,
    );

  const imageUrlsRef =
    useRef<Set<string>>(
      new Set(),
    );

  const autoScrollRef =
    useRef(true);

  useEffect(() => {
    const storedSession =
      window.localStorage.getItem(
        SESSION_STORAGE_KEY,
      );

    const activeSession =
      storedSession ||
      createSessionId();

    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      activeSession,
    );

    setSessionId(
      activeSession,
    );

    try {
      const rawMessages =
        window.localStorage.getItem(
          CHAT_STORAGE_KEY,
        );

      if (!rawMessages) {
        return;
      }

      const restoredMessages =
        normalizeStoredMessages(
          JSON.parse(
            rawMessages,
          ),
        );

      if (
        restoredMessages.length >
        0
      ) {
        setMessages(
          restoredMessages,
        );

        setShowQuestions(
          false,
        );
      }
    } catch {
      window.localStorage.removeItem(
        CHAT_STORAGE_KEY,
      );
    }
  }, []);

  useEffect(() => {
    const textMessages =
      messages
        .filter(
          (
            message,
          ): message is TextChatMessage =>
            message.kind ===
              "text" &&
            !message.isStreaming,
        )
        .map((message) => ({
          id:
            message.id,

          kind:
            "text" as const,

          sender:
            message.sender,

          text:
            message.text,

          isStreaming:
            false,
        }));

    try {
      window.localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(
          textMessages,
        ),
      );
    } catch {
      window.localStorage.removeItem(
        CHAT_STORAGE_KEY,
      );
    }
  }, [messages]);

  useEffect(() => {
    async function loadProfileImage() {
      try {
        const response =
          await fetch(
            "/api/settings",
            {
              cache:
                "no-store",
            },
          );

        const result =
          await response.json();

        if (
          response.ok &&
          result.success &&
          result.data
        ) {
          const settings =
            result.data as ChatbotSettings;

          setProfileImage(
            settings
              .navbar_image_url
              ?.trim() ||
              FALLBACK_IMAGE,
          );

          setImageFailed(
            false,
          );
        }
      } catch {
        setProfileImage(
          FALLBACK_IMAGE,
        );
      }
    }

    void loadProfileImage();
  }, []);

  useEffect(() => {
    if (
      !autoScrollRef.current
    ) {
      return;
    }

    window.requestAnimationFrame(
      () => {
        scrollToBottom(
          "auto",
        );
      },
    );
  }, [
    messages,
    isWaitingForFirstToken,
    pendingImages,
  ]);

  useEffect(() => {
    const imageUrls =
      imageUrlsRef.current;

    return () => {
      requestControllerRef.current?.abort();

      for (
        const imageUrl of
        imageUrls
      ) {
        URL.revokeObjectURL(
          imageUrl,
        );
      }
    };
  }, []);

  function scrollToBottom(
    behavior: ScrollBehavior =
      "smooth",
  ) {
    const container =
      scrollAreaRef.current;

    if (!container) {
      return;
    }

    autoScrollRef.current =
      true;

    container.scrollTo({
      top:
        container.scrollHeight,

      behavior,
    });

    setShowScrollButton(
      false,
    );
  }

  function updateScrollButton() {
    const container =
      scrollAreaRef.current;

    if (!container) {
      return;
    }

    const distance =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    const isNearBottom =
      distance < 100;

    autoScrollRef.current =
      isNearBottom;

    setShowScrollButton(
      !isNearBottom,
    );
  }

  function handleChatWheel(
    event: WheelEvent<HTMLDivElement>,
  ) {
    event.stopPropagation();
  }

  function finishStreamingMessage(
    messageId: string,
  ) {
    setMessages(
      (current) =>
        current.map(
          (message) =>
            message.kind ===
              "text" &&
            message.id ===
              messageId
              ? {
                  ...message,

                  isStreaming:
                    false,
                }
              : message,
        ),
    );
  }

  function stopGenerating() {
    requestControllerRef.current?.abort();

    requestControllerRef.current =
      null;

    setMessages(
      (current) =>
        current.map(
          (message) =>
            message.kind ===
              "text" &&
            message.isStreaming
              ? {
                  ...message,

                  isStreaming:
                    false,
                }
              : message,
        ),
    );

    setIsBusy(
      false,
    );

    setIsWaitingForFirstToken(
      false,
    );
  }

  function removePendingImagesWithoutRevoking() {
    setPendingImages(
      [],
    );
  }

  function clearPendingImages() {
    setPendingImages(
      (current) => {
        for (
          const attachment of
          current
        ) {
          URL.revokeObjectURL(
            attachment.previewUrl,
          );

          imageUrlsRef.current.delete(
            attachment.previewUrl,
          );
        }

        return [];
      },
    );
  }

  async function handleSelectImages(
    files: File[],
  ) {
    const availableSlots =
      MAX_IMAGE_COUNT -
      pendingImages.length;

    if (
      availableSlots <=
      0
    ) {
      setErrorMessage(
        "You can attach up to five images.",
      );

      return;
    }

    const selectedFiles =
      files.slice(
        0,
        availableSlots,
      );

    if (
      files.length >
      availableSlots
    ) {
      setErrorMessage(
        `Only ${availableSlots} more image${availableSlots === 1 ? "" : "s"} can be attached.`,
      );
    } else {
      setErrorMessage(
        "",
      );
    }

    for (
      const file of
      selectedFiles
    ) {
      try {
        const attachment =
          await prepareImageAttachment(
            file,
          );

        imageUrlsRef.current.add(
          attachment.previewUrl,
        );

        setPendingImages(
          (current) => [
            ...current,
            attachment,
          ],
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "An image could not be prepared.",
        );
      }
    }
  }

  function handleRemoveImage(
    id: string,
  ) {
    setPendingImages(
      (current) => {
        const removed =
          current.find(
            (attachment) =>
              attachment.id ===
              id,
          );

        if (
          removed
        ) {
          URL.revokeObjectURL(
            removed.previewUrl,
          );

          imageUrlsRef.current.delete(
            removed.previewUrl,
          );
        }

        return current.filter(
          (attachment) =>
            attachment.id !==
            id,
        );
      },
    );
  }

  async function uploadPendingImages(
    attachments: PendingImageAttachment[],
    controller: AbortController,
  ) {
    const metadataResponse =
      await fetch(
        "/api/chat-images/upload-url",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              sessionId,

              files:
                attachments.map(
                  (
                    attachment,
                  ) => ({
                    id:
                      attachment.id,

                    name:
                      attachment.file.name,

                    type:
                      attachment.file.type,

                    size:
                      attachment.file.size,
                  }),
                ),
            }),

          signal:
            controller.signal,
        },
      );

    let metadataResult: {
      success?: boolean;
      message?: string;
      uploads?: SignedUploadItem[];
    };

    try {
      metadataResult =
        await metadataResponse.json();
    } catch {
      throw new Error(
        "The upload server returned an unreadable response.",
      );
    }

    if (
      !metadataResponse.ok ||
      !metadataResult.success ||
      !Array.isArray(
        metadataResult.uploads,
      )
    ) {
      throw new Error(
        typeof metadataResult.message ===
          "string"
          ? metadataResult.message
          : "Could not prepare the image uploads.",
      );
    }

    const uploads =
      metadataResult.uploads;

    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL;

    const anonKey =
      process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      !supabaseUrl ||
      !anonKey
    ) {
      throw new Error(
        "The browser upload configuration is missing.",
      );
    }

    const supabase =
      createClient(
        supabaseUrl,
        anonKey,
        {
          auth: {
            persistSession:
              false,

            autoRefreshToken:
              false,
          },
        },
      );

    await Promise.all(
      uploads.map(
        async (
          upload,
        ) => {
          const attachment =
            attachments.find(
              (item) =>
                item.id ===
                upload.id,
            );

          if (
            !attachment
          ) {
            throw new Error(
              "An uploaded image could not be matched.",
            );
          }

          setPendingImages(
            (current) =>
              current.map(
                (item) =>
                  item.id ===
                    attachment.id
                    ? {
                        ...item,

                        status:
                          "uploading",

                        progress:
                          35,
                      }
                    : item,
              ),
          );

          const {
            error,
          } =
            await supabase
              .storage
              .from(
                "chatbot-uploads",
              )
              .uploadToSignedUrl(
                upload.path,
                upload.token,
                attachment.file,
                {
                  contentType:
                    attachment.file.type,

                  upsert:
                    false,
                },
              );

          if (
            error
          ) {
            throw new Error(
              error.message,
            );
          }

          setPendingImages(
            (current) =>
              current.map(
                (item) =>
                  item.id ===
                    attachment.id
                    ? {
                        ...item,

                        status:
                          "uploaded",

                        progress:
                          100,

                        storagePath:
                          upload.path,
                      }
                    : item,
              ),
          );
        },
      ),
    );

    return uploads.map(
      (upload) =>
        upload.path,
    );
  }

  async function analyzeImages(
    visitorMessage: TextChatMessage,
    attachments: PendingImageAttachment[],
  ) {
    setThinkingMode(
      "image",
    );

    setIsBusy(
      true,
    );

    setIsWaitingForFirstToken(
      true,
    );

    setErrorMessage(
      "",
    );

    const controller =
      new AbortController();

    requestControllerRef.current =
      controller;

    try {
      const paths =
        await uploadPendingImages(
          attachments,
          controller,
        );

      const response =
        await fetch(
          "/api/analyze-images",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                prompt:
                  visitorMessage.text,

                paths,
              }),

            signal:
              controller.signal,
          },
        );

      let result: {
        success?: boolean;
        message?: string;
      };

      try {
        result =
          await response.json();
      } catch {
        throw new Error(
          "The image-analysis server returned an unreadable response.",
        );
      }

      if (
        !response.ok ||
        !result.success ||
        typeof result.message !==
          "string"
      ) {
        throw new Error(
          typeof result.message ===
            "string"
            ? result.message
            : "The images could not be analyzed.",
        );
      }

      const analysisAnswer =
        result.message;

      setMessages(
        (current): ChatMessage[] => [
          ...current,

          {
            id:
              createMessageId(),

            kind:
              "text",

            sender:
              "assistant",

            text:
              analysisAnswer,

            isStreaming:
              false,
          },
        ],
      );

      removePendingImagesWithoutRevoking();
    } catch (error) {
      if (
        error instanceof
          DOMException &&
        error.name ===
          "AbortError"
      ) {
        return;
      }

      setPendingImages(
        (current) =>
          current.map(
            (attachment) => ({
              ...attachment,

              status:
                attachment.status ===
                  "uploaded"
                  ? "uploaded"
                  : "error",

              error:
                attachment.status ===
                  "uploaded"
                  ? null
                  : "Upload failed.",
            }),
          ),
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The images could not be analyzed.",
      );
    } finally {
      setIsBusy(
        false,
      );

      setIsWaitingForFirstToken(
        false,
      );

      if (
        requestControllerRef.current ===
        controller
      ) {
        requestControllerRef.current =
          null;
      }
    }
  }

  async function generateImage(
    prompt: string,
    replaceMessageId?: string,
  ) {
    const cleanPrompt =
      cleanImageGenerationPrompt(
        prompt,
      ) ||
      prompt.trim();

    setThinkingMode(
      "image",
    );

    setIsBusy(
      true,
    );

    setIsWaitingForFirstToken(
      true,
    );

    setErrorMessage(
      "",
    );

    if (
      replaceMessageId
    ) {
      setRegeneratingMessageId(
        replaceMessageId,
      );
    }

    const controller =
      new AbortController();

    requestControllerRef.current =
      controller;

    try {
      const response =
        await fetch(
          "/api/generate-image",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                prompt:
                  cleanPrompt,
              }),

            signal:
              controller.signal,
          },
        );

      if (!response.ok) {
        let message =
          "The image could not be generated.";

        try {
          const result =
            await response.json();

          if (
            typeof result.message ===
            "string"
          ) {
            message =
              result.message;
          }
        } catch {
          // Keep the fallback message.
        }

        throw new Error(
          message,
        );
      }

      const imageBlob =
        await response.blob();

      const imageUrl =
        URL.createObjectURL(
          imageBlob,
        );

      imageUrlsRef.current.add(
        imageUrl,
      );

      const generatedMessage: ImageChatMessage =
        {
          id:
            replaceMessageId ||
            createMessageId(),

          kind:
            "image",

          sender:
            "assistant",

          prompt:
            cleanPrompt,

          imageUrl,
        };

      setMessages(
        (current) => {
          if (
            !replaceMessageId
          ) {
            return [
              ...current,
              generatedMessage,
            ];
          }

          return current.map(
            (message) => {
              if (
                message.id !==
                replaceMessageId
              ) {
                return message;
              }

              if (
                message.kind ===
                "image"
              ) {
                URL.revokeObjectURL(
                  message.imageUrl,
                );

                imageUrlsRef.current.delete(
                  message.imageUrl,
                );
              }

              return generatedMessage;
            },
          );
        },
      );
    } catch (error) {
      if (
        error instanceof
          DOMException &&
        error.name ===
          "AbortError"
      ) {
        return;
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The image could not be generated.",
      );
    } finally {
      setIsBusy(
        false,
      );

      setIsWaitingForFirstToken(
        false,
      );

      setRegeneratingMessageId(
        null,
      );

      if (
        requestControllerRef.current ===
        controller
      ) {
        requestControllerRef.current =
          null;
      }
    }
  }

  async function sendTextMessage(
    visitorMessage: TextChatMessage,
  ) {
    const selectedMode:
      ThinkingMode =
      requiresLiveInformation(
        visitorMessage.text,
      )
        ? "live"
        : "standard";

    setThinkingMode(
      selectedMode,
    );

    setIsBusy(
      true,
    );

    setIsWaitingForFirstToken(
      true,
    );

    requestControllerRef.current?.abort();

    const controller =
      new AbortController();

    requestControllerRef.current =
      controller;

    const assistantMessageId =
      createMessageId();

    let assistantMessageCreated =
      false;

    try {
      const response =
        await fetch(
          "/api/assistant",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                sessionId,

                messages:
                  createApiContext(
                    messages,
                    visitorMessage,
                  ),
              }),

            signal:
              controller.signal,
          },
        );

      if (!response.ok) {
        let message =
          `The assistant request failed with status ${response.status}.`;

        try {
          const result =
            await response.json();

          if (
            typeof result.message ===
            "string"
          ) {
            message =
              result.message;
          }
        } catch {
          // Keep the fallback message.
        }

        throw new Error(
          message,
        );
      }

      const reader =
        response.body?.getReader();

      if (!reader) {
        throw new Error(
          "The assistant response did not contain a readable stream.",
        );
      }

      const decoder =
        new TextDecoder();

      let buffer = "";
      let streamFinished =
        false;

      while (!streamFinished) {
        const {
          value,
          done,
        } =
          await reader.read();

        if (done) {
          break;
        }

        buffer +=
          decoder.decode(
            value,
            {
              stream:
                true,
            },
          );

        const blocks =
          buffer.split(
            "\n\n",
          );

        buffer =
          blocks.pop() ||
          "";

        for (
          const block of
          blocks
        ) {
          const event =
            parseSseBlock(
              block,
            );

          if (!event) {
            continue;
          }

          if (
            event.type ===
            "metadata"
          ) {
            setThinkingMode(
              event.mode,
            );
          }

          if (
            event.type ===
              "delta" &&
            event.text
          ) {
            setIsWaitingForFirstToken(
              false,
            );

            if (
              !assistantMessageCreated
            ) {
              assistantMessageCreated =
                true;

              setMessages(
                (current) => [
                  ...current,

                  {
                    id:
                      assistantMessageId,

                    kind:
                      "text",

                    sender:
                      "assistant",

                    text:
                      event.text,

                    isStreaming:
                      true,
                  },
                ],
              );
            } else {
              setMessages(
                (current) =>
                  current.map(
                    (message) =>
                      message.kind ===
                        "text" &&
                      message.id ===
                        assistantMessageId
                        ? {
                            ...message,

                            text:
                              message.text +
                              event.text,
                          }
                        : message,
                  ),
              );
            }
          }

          if (
            event.type ===
            "error"
          ) {
            throw new Error(
              event.message,
            );
          }

          if (
            event.type ===
            "done"
          ) {
            streamFinished =
              true;

            break;
          }
        }
      }

      if (
        assistantMessageCreated
      ) {
        finishStreamingMessage(
          assistantMessageId,
        );
      } else {
        throw new Error(
          "The assistant returned an empty response.",
        );
      }
    } catch (error) {
      if (
        error instanceof
          DOMException &&
        error.name ===
          "AbortError"
      ) {
        if (
          assistantMessageCreated
        ) {
          finishStreamingMessage(
            assistantMessageId,
          );
        }

        return;
      }

      if (
        assistantMessageCreated
      ) {
        finishStreamingMessage(
          assistantMessageId,
        );
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The assistant could not respond.",
      );
    } finally {
      setIsBusy(
        false,
      );

      setIsWaitingForFirstToken(
        false,
      );

      if (
        requestControllerRef.current ===
        controller
      ) {
        requestControllerRef.current =
          null;
      }
    }
  }

  async function sendMessage(
    rawMessage: string,
  ) {
    const cleanMessage =
      rawMessage.trim();

    if (
      (
        !cleanMessage &&
        pendingImages.length ===
          0
      ) ||
      isBusy
    ) {
      return;
    }

    autoScrollRef.current =
      true;

    setInputValue(
      "",
    );

    setShowQuestions(
      false,
    );

    setErrorMessage(
      "",
    );

    const visitorText =
      cleanMessage ||
      (
        pendingImages.length ===
        1
          ? "Analyze this image."
          : "Analyze these images."
      );

    const attachmentSnapshot =
      pendingImages.map(
        (attachment) => ({
          id:
            attachment.id,

          name:
            attachment.originalName,

          previewUrl:
            attachment.previewUrl,
        }),
      );

    const visitorMessage: TextChatMessage =
      {
        id:
          createMessageId(),

        kind:
          "text",

        sender:
          "visitor",

        text:
          visitorText,

        isStreaming:
          false,

        attachments:
          attachmentSnapshot,
      };

    setMessages(
      (current) => [
        ...current,
        visitorMessage,
      ],
    );

    if (
      pendingImages.length >
      0
    ) {
      const attachmentsForRequest =
        [...pendingImages];

      await analyzeImages(
        visitorMessage,
        attachmentsForRequest,
      );

      return;
    }

    if (
      shouldGenerateImage(
        cleanMessage,
      )
    ) {
      await generateImage(
        cleanMessage,
      );

      return;
    }

    await sendTextMessage(
      visitorMessage,
    );
  }

  function createWhatsAppUrl() {
    const summary =
      messages
        .filter(
          (
            message,
          ): message is TextChatMessage =>
            message.kind ===
              "text" &&
            message.id !==
              "welcome-message",
        )
        .slice(
          -8,
        )
        .map(
          (message) => {
            const speaker =
              message.sender ===
              "visitor"
                ? "Visitor"
                : "Assistant";

            return `${speaker}: ${shortenText(
              message.text,
            )}`;
          },
        )
        .join(
          "\n\n",
        );

    const text = [
      "Hello Mubarok Hossain,",
      "",
      "I contacted you through your portfolio AI assistant.",
      "",
      summary ||
        "I would like to discuss a business opportunity.",
    ].join(
      "\n",
    );

    return (
      `https://wa.me/${WHATSAPP_NUMBER}` +
      `?text=${encodeURIComponent(
        text,
      )}`
    );
  }

  function openWhatsApp() {
    window.open(
      createWhatsAppUrl(),
      "_blank",
      "noopener,noreferrer",
    );
  }

  function handleImageError() {
    if (
      profileImage !==
      FALLBACK_IMAGE
    ) {
      setProfileImage(
        FALLBACK_IMAGE,
      );

      return;
    }

    setImageFailed(
      true,
    );
  }

  function clearConversation() {
    stopGenerating();

    clearPendingImages();

    for (
      const imageUrl of
      imageUrlsRef.current
    ) {
      URL.revokeObjectURL(
        imageUrl,
      );
    }

    imageUrlsRef.current.clear();

    const newSession =
      createSessionId();

    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      newSession,
    );

    window.localStorage.removeItem(
      CHAT_STORAGE_KEY,
    );

    setSessionId(
      newSession,
    );

    setMessages(
      INITIAL_MESSAGES,
    );

    setInputValue(
      "",
    );

    setErrorMessage(
      "",
    );

    setThinkingMode(
      "standard",
    );

    setRegeneratingMessageId(
      null,
    );

    setShowQuestions(
      true,
    );
  }

  return (
    <>
      <div
        className={`fixed inset-x-3 bottom-[82px] z-[90] mx-auto w-auto max-w-[400px] transition-all duration-300 sm:inset-x-auto sm:bottom-24 sm:right-5 sm:mx-0 sm:w-[390px] lg:right-6 lg:w-[410px] ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-5 scale-[0.96] opacity-0"
        }`}
      >
        <section className="relative grid max-h-[calc(100dvh-98px)] w-full min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[30px] border border-white/10 bg-[#060a16]/98 text-white shadow-[0_35px_120px_rgba(0,0,0,0.72),0_0_70px_rgba(99,102,241,0.16)] backdrop-blur-2xl sm:max-h-[700px]">
          <div className="pointer-events-none absolute -left-20 -top-24 h-52 w-52 rounded-full bg-cyan-500/15 blur-[80px]" />

          <div className="pointer-events-none absolute -right-20 top-20 h-56 w-56 rounded-full bg-violet-500/20 blur-[90px]" />

          <ChatHeader
            profileImage={
              profileImage
            }
            imageFailed={
              imageFailed
            }
            onImageError={
              handleImageError
            }
            onWhatsApp={
              openWhatsApp
            }
            onReset={
              clearConversation
            }
            onClose={() =>
              setIsOpen(
                false,
              )
            }
          />

          <ChatMessages
            messages={
              messages
            }
            isBusy={
              isBusy
            }
            isWaitingForFirstToken={
              isWaitingForFirstToken
            }
            thinkingMode={
              thinkingMode
            }
            errorMessage={
              errorMessage
            }
            showQuestions={
              showQuestions
            }
            showScrollButton={
              showScrollButton
            }
            regeneratingMessageId={
              regeneratingMessageId
            }
            scrollAreaRef={
              scrollAreaRef
            }
            onScroll={
              updateScrollButton
            }
            onWheel={
              handleChatWheel
            }
            onQuickQuestion={(
              question,
            ) => {
              void sendMessage(
                question,
              );
            }}
            onRegenerateImage={(
              prompt,
              messageId,
            ) => {
              void generateImage(
                prompt,
                messageId,
              );
            }}
            onScrollToBottom={() =>
              scrollToBottom()
            }
          />

          <ChatInput
            value={
              inputValue
            }
            isBusy={
              isBusy
            }
            attachments={
              pendingImages
            }
            onChange={
              setInputValue
            }
            onSend={(
              value,
            ) => {
              void sendMessage(
                value,
              );
            }}
            onStop={
              stopGenerating
            }
            onSelectImages={(
              files,
            ) => {
              void handleSelectImages(
                files,
              );
            }}
            onRemoveImage={
              handleRemoveImage
            }
          />
        </section>
      </div>

      <button
        type="button"
        onClick={() =>
          setIsOpen(
            (current) =>
              !current,
          )
        }
        aria-label={
          isOpen
            ? "Close AI assistant"
            : "Open AI assistant"
        }
        className="fixed bottom-4 right-4 z-[91] flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200/25 bg-gradient-to-br from-emerald-400 via-cyan-400 to-violet-500 text-slate-950 shadow-[0_20px_60px_rgba(34,211,238,0.3)] transition duration-300 hover:-translate-y-1 hover:scale-105 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
      >
        {isOpen ? (
          <FiX className="h-6 w-6 sm:h-7 sm:w-7" />
        ) : (
          <FiMessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
        )}
      </button>
    </>
  );
}
