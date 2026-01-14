import data from "@emoji-mart/data";
import EmojiPicker from "@emoji-mart/react";
import clsx from "clsx";

import { yupResolver } from "@hookform/resolvers/yup";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalHeader,
  Offcanvas,
  OffcanvasHeader,
  Row,
  Spinner,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import IconifyIcon from "@/components/dashboard/wrappers/IconifyIcon";
import SimplebarReactClient from "@/components/dashboard/wrappers/SimplebarReactClient";
import { useChatContext, type Conversation, type Message } from "@/context/useChatContext";
import { useLayoutContext } from "@/context/useLayoutContext";
import { timeSince } from "@/utils/date";
import { getFileExtensionIcon } from "@/utils/get-icons";

import small1 from "@/assets/dashboard/images/small/img-1.jpg";
import small2 from "@/assets/dashboard/images/small/img-2.jpg";
import small3 from "@/assets/dashboard/images/small/img-3.jpg";
import avatar1 from "@/assets/dashboard/images/users/avatar-1.jpg";
import TextFormInput from "@/components/dashboard/from/TextFormInput";
import Image from "next/image";
import Link from "next/link";

const MessageDropdown = ({
  message,
  isOwnMessage,
}: {
  message: Message;
  isOwnMessage: boolean;
}) => {
  return (
    <Dropdown
      drop={isOwnMessage ? "end" : "start"}
      className="chat-conversation-actions"
    >
      <DropdownToggle as={"a"} role="button" className="ps-1">
        <IconifyIcon icon="bx:dots-vertical-rounded" className="fs-18" />
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem>
          <IconifyIcon icon="bx:share" className="me-2" />
          Répondre
        </DropdownItem>
        <DropdownItem>
          <IconifyIcon icon="bx:share-alt" className="me-2" />
          Transférer
        </DropdownItem>
        <DropdownItem>
          <IconifyIcon icon="bx:copy" className="me-2" />
          Copier
        </DropdownItem>
        <DropdownItem>
          <IconifyIcon icon="bx:bookmark" className="me-2" />
          Marquer
        </DropdownItem>
        <DropdownItem>
          <IconifyIcon icon="bx:trash" className="me-2" />
          Supprimer
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

// Simplified components for video/voice calls - to be fully implemented later
const VideoCall = () => {
  const { videoCall } = useChatContext();
  return (
    <li className="list-inline-item fs-20 dropdown">
      <div
        role="button"
        className="btn btn-light avatar-sm d-flex align-items-center justify-content-center text-dark fs-20"
        onClick={videoCall.toggle}
        title="Appel vidéo (bientôt disponible)"
      >
        <span>
          <IconifyIcon icon="solar:videocamera-record-bold-duotone" />
        </span>
      </div>
    </li>
  );
};

const VoiceCall = () => {
  const { voiceCall } = useChatContext();
  return (
    <li className="list-inline-item fs-20 dropdown">
      <div
        role="button"
        className="btn btn-light avatar-sm d-flex align-items-center justify-content-center text-dark fs-20"
        onClick={voiceCall.toggle}
        title="Appel vocal (bientôt disponible)"
      >
        <span>
          <IconifyIcon icon="solar:outgoing-call-rounded-bold-duotone" />
        </span>
      </div>
    </li>
  );
};

const ProfileDetail = ({ conversation }: { conversation: Conversation }) => {
  const { chatProfile } = useChatContext();

  const getConversationInfo = () => {
    if (conversation.type === "group") {
      return {
        name: conversation.name || "Groupe",
        avatar: conversation.avatar || avatar1,
      };
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.user._id !== conversation.participants[0]?.user._id
    );
    return {
      name: otherParticipant?.user.name || "Utilisateur",
      avatar: otherParticipant?.user.avatar || avatar1,
    };
  };

  const { name, avatar } = getConversationInfo();

  return (
    <>
      <li className="list-inline-item fs-20 dropdown">
        <div
          role="button"
          className="btn btn-light avatar-sm d-flex align-items-center justify-content-center text-dark fs-20"
          onClick={chatProfile.toggle}
        >
          <span>
            <IconifyIcon icon="solar:user-bold-duotone" />
          </span>
        </div>
      </li>

      <Offcanvas
        show={chatProfile.open}
        onHide={chatProfile.toggle}
        placement="end"
        className="shadow border-start"
        data-bs-scroll="true"
        tabIndex={-1}
      >
        <OffcanvasHeader closeButton>
          <h5 className="offcanvas-title text-truncate w-50">Profil</h5>
        </OffcanvasHeader>
        <SimplebarReactClient className="offcanvas-body p-0 h-100">
          <div className="p-3">
            <div className="text-center">
              <Image
                src={avatar}
                alt={name}
                className="img-thumbnail avatar-lg rounded-circle mb-1"
                width={80}
                height={80}
              />
              <h4>{name}</h4>
              {conversation.type === "group" ? (
                <p className="text-muted mt-2">
                  {conversation.participants.length} participants
                </p>
              ) : (
                <p className="text-muted mt-2">Conversation directe</p>
              )}
            </div>
            {conversation.description && (
              <div className="mt-3">
                <hr />
                <p className="mt-3 mb-1">
                  <strong>Description:</strong>
                </p>
                <p>{conversation.description}</p>
              </div>
            )}
          </div>
        </SimplebarReactClient>
      </Offcanvas>
    </>
  );
};

const UserMessage = ({
  message,
  currentUserId,
}: {
  message: Message;
  currentUserId?: string;
}) => {
  const isOwnMessage = message.sender._id === currentUserId;
  const senderAvatar = message.sender.avatar || avatar1;

  return (
    <li
      className={clsx("clearfix gap-2 d-flex", {
        "justify-content-end odd": isOwnMessage,
      })}
    >
      {!isOwnMessage && (
        <div className="chat-avatar text-center">
          <Image
            src={senderAvatar}
            alt={message.sender.name}
            className="avatar rounded-circle"
            width={40}
            height={40}
          />
        </div>
      )}
      <div
        className={clsx("chat-conversation-text", {
          "ms-0": isOwnMessage,
        })}
      >
        {isOwnMessage ? (
          <p className="mb-2 text-end">
            <span className="text-muted fs-12 me-1">
              {timeSince(new Date(message.createdAt))}
            </span>
            <span className="text-dark fw-medium me-1">Vous</span>
          </p>
        ) : (
          <p className="mb-2">
            <span className="text-dark fw-medium me-1">
              {message.sender.name}
            </span>
            <span className="text-muted fs-12">
              {timeSince(new Date(message.createdAt))}
            </span>
          </p>
        )}
        <div
          className={clsx("d-flex", {
            "justify-content-end": isOwnMessage,
          })}
        >
          {isOwnMessage && (
            <MessageDropdown message={message} isOwnMessage={isOwnMessage} />
          )}
          <div className="chat-ctext-wrap d-flex">
            {message.type === "text" && <p className="">{message.content}</p>}
            {message.type === "image" && message.attachments.length > 0 && (
              <div className="d-flex flex-wrap gap-1">
                {message.attachments.map((attachment, idx) => (
                  <div role="button" key={idx}>
                    <Image
                      src={attachment.url}
                      alt="attachment"
                      height={84}
                      width={121}
                      className="img-thumbnail"
                    />
                  </div>
                ))}
              </div>
            )}
            {message.type === "file" && message.attachments.length > 0 && (
              <div className="d-flex flex-column gap-2">
                {message.attachments.map((attachment, idx) => (
                  <div
                    key={idx}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <div className="flex-shrink-0">
                      <IconifyIcon
                        icon={getFileExtensionIcon(
                          attachment.name || attachment.url
                        )}
                        className="fs-24 me-1 text-success"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <span role="button" className="text-dark">
                        {attachment.name || "Fichier"}
                      </span>
                      {attachment.size && (
                        <p className="mb-0">
                          {(attachment.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {!isOwnMessage && (
            <MessageDropdown message={message} isOwnMessage={isOwnMessage} />
          )}
        </div>
        {isOwnMessage && (
          <p className="mb-0 text-end">
            <IconifyIcon
              icon={
                message.status === "read"
                  ? "ri:check-double-line"
                  : message.status === "delivered"
                  ? "ri:check-double-line"
                  : "ri:check-line"
              }
              className={`fs-16 ${
                message.status === "read" ? "text-primary" : "text-muted"
              }`}
            />
          </p>
        )}
      </div>
      {isOwnMessage && (
        <div className="chat-avatar text-center ms-2">
          <Image
            src={senderAvatar}
            alt={message.sender.name}
            className="avatar rounded-circle"
            width={40}
            height={40}
          />
        </div>
      )}
    </li>
  );
};

const ChatArea = ({ conversation }: { conversation: Conversation }) => {
  const messageSchema = yup.object({
    newMessage: yup.string().required("Veuillez entrer un message"),
  });

  const { reset, handleSubmit, control } = useForm({
    resolver: yupResolver(messageSchema),
  });

  const { messages, loadingMessages, sendMessage, chatList, chatProfile } =
    useChatContext();

  // Get conversation display info
  const getConversationInfo = () => {
    if (conversation.type === "group") {
      return {
        name: conversation.name || "Groupe",
        avatar: conversation.avatar || avatar1,
      };
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.user._id !== conversation.participants[0]?.user._id // TODO: use actual current user ID
    );
    return {
      name: otherParticipant?.user.name || "Utilisateur",
      avatar: otherParticipant?.user.avatar || avatar1,
    };
  };

  const { name, avatar } = getConversationInfo();

  // TODO: Get current user ID from session/auth
  const currentUserId = conversation.participants[0]?.user._id;

  /**
   * sends the chat message
   */
  const handleSendMessage = async (values: { newMessage?: string }) => {
    if (!values.newMessage || !values.newMessage.trim()) return;

    try {
      await sendMessage(values.newMessage.trim());
      reset();
    } catch (error) {
    }
  };

  const AlwaysScrollToBottom = () => {
    const elementRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (
        elementRef &&
        elementRef.current &&
        elementRef.current.scrollIntoView
      ) {
        elementRef.current.scrollIntoView({ behavior: "smooth" });
      }
    });
    return <div ref={elementRef} />;
  };

  const { theme } = useLayoutContext();

  return (
    <Card className="position-relative overflow-hidden">
      <CardHeader className="d-flex align-items-center mh-100">
        <Button
          variant="light"
          onClick={chatList.toggle}
          className="d-xxl-none d-flex align-items-center px-2 me-2"
          type="button"
        >
          <IconifyIcon icon="bx:menu" className="fs-18" />
        </Button>
        <div className="d-flex align-items-center">
          <Image
            src={avatar}
            className="me-2 rounded"
            width={36}
            height={36}
            alt="avatar"
          />
          <div className="d-none d-md-flex flex-column">
            <h5 className="my-0 fs-16 fw-semibold">
              <span
                role="button"
                onClick={chatProfile.toggle}
                className="text-dark"
              >
                {name}
              </span>
            </h5>
            <p className="mb-0 text-muted fs-12">
              {conversation.type === "group"
                ? `${conversation.participants.length} participants`
                : "Conversation directe"}
            </p>
          </div>
        </div>
        <div className="flex-grow-1">
          <ul className="list-inline float-end d-flex gap-1 mb-0">
            <VideoCall />

            <VoiceCall />

            <ProfileDetail conversation={conversation} />

            <Dropdown className="list-inline-item fs-20 d-none d-md-flex">
              <DropdownToggle
                as={"a"}
                role="button"
                className="arrow-none text-dark"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <IconifyIcon icon="bx:dots-vertical-rounded" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-end">
                <DropdownItem>
                  <IconifyIcon icon="ri:user-6-line" className="me-2" />
                  View Profile
                </DropdownItem>
                <DropdownItem>
                  <IconifyIcon icon="ri:music-2-line" className="me-2" />
                  Media, Links and Docs
                </DropdownItem>
                <DropdownItem>
                  <IconifyIcon icon="ri:search-2-line" className="me-2" />
                  Search
                </DropdownItem>
                <DropdownItem>
                  <IconifyIcon icon="ri:image-line" className="me-2" />
                  Wallpaper
                </DropdownItem>
                <DropdownItem>
                  <IconifyIcon
                    icon="ri:arrow-right-circle-line"
                    className="me-2"
                  />
                  More
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </ul>
        </div>
      </CardHeader>
      <div className="chat-box">
        <SimplebarReactClient className="chat-conversation-list p-3 chatbox-height">
          {loadingMessages ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Chargement des messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-5">
              <IconifyIcon
                icon="bi:chat-dots"
                className="fs-1 text-muted"
              />
              <p className="mt-3 text-muted">Aucun message</p>
              <p className="text-muted">
                Envoyez un message pour commencer la conversation
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <UserMessage
                  message={message}
                  currentUserId={currentUserId}
                  key={message._id}
                />
              ))}
              <AlwaysScrollToBottom />
            </>
          )}
        </SimplebarReactClient>

        <div className="bg-light bg-opacity-50 p-2">
          <form
            className="needs-validation"
            name="chat-form"
            id="chat-form"
            onSubmit={handleSubmit(handleSendMessage)}
          >
            <Row className="align-items-center">
              <Col className="mb-2 mb-sm-0 d-flex">
                <div className="input-group flex-nowrap">
                  <Dropdown drop="up">
                    <DropdownToggle
                      type="button"
                      className="btn btn-sm btn-primary rounded-start d-flex align-items-center input-group-text content-none"
                    >
                      <IconifyIcon
                        width={18}
                        height={27}
                        icon="ri:emotion-line"
                        className="fs-18"
                      />
                    </DropdownToggle>
                    <DropdownMenu className="p-0 rounded-4">
                      <EmojiPicker
                        data={data}
                        theme={theme}
                        onEmojiSelect={(e: any) => {
                          // Emoji selection handler - to be implemented
                        }}
                      />
                    </DropdownMenu>
                  </Dropdown>
                  <TextFormInput
                    name="newMessage"
                    type="text"
                    className="form-control border-0 chat-input"
                    placeholder="Tapez votre message..."
                    containerClassName="w-100"
                    control={control}
                  />
                </div>
              </Col>
              <Col xs="auto">
                <Button
                  variant="primary"
                  type="submit"
                  className="chat-send w-100 btn btn-primary"
                >
                  <IconifyIcon
                    icon="ri:send-plane-2-line"
                    className="align-middle"
                  />
                </Button>
              </Col>
            </Row>
          </form>
        </div>
      </div>
    </Card>
  );
};

export default ChatArea;
