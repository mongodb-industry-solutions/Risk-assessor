import { css } from "@emotion/css";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { Error as ErrorText } from "@leafygreen-ui/typography";
import {
  InputBar,
  MongoDbInputBarPlaceholder,
  SuggestedPrompt,
  SuggestedPrompts,
} from "./InputBar";
import { defaultChatbotFatalErrorMessage } from "./ui-text";
import { useState } from "react";
import { ChatbotTriggerProps } from "./ChatbotTrigger";
import { useChatbotContext } from "./useChatbotContext";
import classNames from "classnames";
import { PoweredByAtlasVectorSearch } from "./PoweredByAtlasVectorSearch";

const styles = {
  info_box: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 8px;
  `,
  chatbot_container: css`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    & * {
      box-sizing: border-box;
    }
  }`,
  chatbot_input: css`
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `,
  powered_by_footer: css`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding-right: 24px;
  `,
};

export type InputBarTriggerProps = ChatbotTriggerProps & {
  bottomContent?: React.ReactNode;
  fatalErrorMessage?: string;
  placeholder?: string;
  suggestedPrompts?: string[];
};

export function InputBarTrigger(props: InputBarTriggerProps) {
  const { darkMode } = useDarkMode(props.darkMode);
  const {
    className,
    suggestedPrompts = [],
    bottomContent,
    fatalErrorMessage = defaultChatbotFatalErrorMessage,
  } = props;
  const {
    openChat,
    awaitingReply,
    handleSubmit,
    conversation,
    inputText,
    setInputText,
    inputTextError,
    isExperimental,
  } = useChatbotContext();

  const [focused, setFocused] = useState(false);
  const canSubmit = inputTextError.length === 0 && !conversation.error;
  const hasError = inputTextError !== "";
  const showError = inputTextError !== "" && !open;
  const showSuggestedPrompts =
    suggestedPrompts.length > 0 &&
    inputText.length === 0 &&
    conversation.messages.length === 0 &&
    !awaitingReply;
  const badgeText =
    focused || inputText.length > 0
      ? undefined
      : isExperimental
      ? "Experimental"
      : undefined;
  const inputPlaceholder = conversation.error
    ? fatalErrorMessage
    : props.placeholder ?? MongoDbInputBarPlaceholder();

  return (
    <div className={classNames(styles.chatbot_container, className)}>
      <div className={styles.chatbot_input}>
        <InputBar
          key={"inputBarTrigger"}
          darkMode={darkMode}
          hasError={hasError ?? false}
          badgeText={badgeText}
          dropdownProps={{
            usePortal: false,
          }}
          dropdownFooterSlot={
            <div className={styles.powered_by_footer}>
              <PoweredByAtlasVectorSearch />
            </div>
          }
          textareaProps={{
            value: inputText,
            onChange: (e) => {
              setInputText(e.target.value);
            },
            placeholder: inputPlaceholder,
          }}
          onMessageSend={async (messageContent) => {
            if (conversation.messages.length > 0) {
              openChat();
              return;
            }
            if (canSubmit) {
              await handleSubmit(messageContent);
            }
          }}
          onClick={async () => {
            if (conversation.messages.length > 0) {
              openChat();
            }
            if (!conversation.conversationId) {
              await conversation.createConversation();
            }
          }}
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => {
            setFocused(false);
          }}
        >
          {showSuggestedPrompts ? (
            <SuggestedPrompts label="SUGGESTED AI PROMPTS">
              {suggestedPrompts?.map((suggestedPrompt) => (
                <SuggestedPrompt
                  key={suggestedPrompt}
                  onClick={async () => {
                    await handleSubmit(suggestedPrompt);
                  }}
                >
                  {suggestedPrompt}
                </SuggestedPrompt>
              )) ?? null}
            </SuggestedPrompts>
          ) : undefined}
        </InputBar>

        <div className={styles.info_box}>
          {showError ? <ErrorText>{inputTextError}</ErrorText> : null}
          {bottomContent}
        </div>
      </div>
    </div>
  );
}
