export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface BirthProfile {
  id: string;
  full_name: string;
  gender: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
}

export interface BirthProfileInput {
  full_name: string;
  gender: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
}

export interface Planet {
  name: string;
  longitude: number;
  sign: string;
  degree_in_sign: number;
  retrograde: boolean;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  aspect: string;
  angle: number;
  orb: number;
}

export interface BirthChart {
  id: string;
  chart_data: {
    planets: Planet[];
    aspects: Aspect[];
    ayanamsa: string;
    julian_day: number;
  };
  ayanamsa: string;
}

export interface Transits {
  timestamp: string;
  planets: Planet[];
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface HouseData {
  house: number;       // 1-12
  sign: string;        // e.g. "Aries"
  planets: string[];   // abbreviations: ["Su", "Mo"]
}

export interface VoiceResponse {
  transcript: string;
  response: {
    id: string;
    content: string;
    audio_base64: string;
  };
}
