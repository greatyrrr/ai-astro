import { Platform } from "react-native";
import client from "./client";
import type {
  Token,
  BirthProfile,
  BirthProfileInput,
  BirthChart,
  Transits,
  Conversation,
  ConversationDetail,
  Message,
  VoiceResponse,
} from "../types";

// --- Auth ---

export async function register(
  email: string,
  password: string,
  full_name: string,
  birth_date: string,
  birth_time: string,
  birth_location: string,
  gender: string = "Other"
): Promise<Token> {
  const { data } = await client.post<Token>("/auth/register", {
    email,
    password,
    full_name,
    birth_date,
    birth_time,
    birth_location,
    gender,
  });
  return data;
}

export async function login(
  email: string,
  password: string
): Promise<Token> {
  const { data } = await client.post<Token>("/auth/login", {
    email,
    password,
  });
  return data;
}

// --- Birth Profile ---

export async function createBirthProfile(
  input: BirthProfileInput
): Promise<BirthProfile> {
  const { data } = await client.post<BirthProfile>("/birth-profiles", input);
  return data;
}

export async function getBirthProfile(): Promise<BirthProfile> {
  const { data } = await client.get<BirthProfile>("/birth-profiles/me");
  return data;
}

// --- Chart ---

export async function getChart(): Promise<BirthChart> {
  const { data } = await client.get<BirthChart>("/charts/me");
  return data;
}

export async function getTransits(): Promise<Transits> {
  const { data } = await client.get<Transits>("/charts/transits");
  return data;
}

// --- Conversations ---

export async function createConversation(
  title: string = "New Conversation"
): Promise<Conversation> {
  const { data } = await client.post<Conversation>("/chat/conversations", {
    title,
  });
  return data;
}

export async function getConversations(): Promise<Conversation[]> {
  const { data } = await client.get<Conversation[]>("/chat/conversations");
  return data;
}

export async function getConversation(
  id: string
): Promise<ConversationDetail> {
  const { data } = await client.get<ConversationDetail>(
    `/chat/conversations/${id}`
  );
  return data;
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<Message> {
  const { data } = await client.post<Message>(
    `/chat/conversations/${conversationId}/messages`,
    { content }
  );
  return data;
}

// --- Voice ---

export async function sendVoiceMessage(
  conversationId: string,
  audioUri: string
): Promise<VoiceResponse> {
  const form = new FormData();

  if (Platform.OS === "web") {
    // On web, fetch the blob URI and create a real File object
    const response = await fetch(audioUri);
    const blob = await response.blob();
    form.append("audio", blob, "recording.webm");
  } else {
    // On native, use the RN-style file descriptor
    form.append("audio", {
      uri: audioUri,
      name: "recording.m4a",
      type: "audio/m4a",
    } as unknown as Blob);
  }

  const { data } = await client.post<VoiceResponse>(
    `/chat/conversations/${conversationId}/voice`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function getMessageAudio(
  messageId: string
): Promise<{ message_id: string; audio_base64: string }> {
  const { data } = await client.get(`/chat/messages/${messageId}/audio`);
  return data;
}
