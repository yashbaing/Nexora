import axios from "axios";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5001";

const client = axios.create({
  baseURL: BACKEND_URL,
  timeout: 12000,
});

export interface WaitlistJoinResponse {
  message: string;
  position: number;
  total: number;
  alreadyJoined: boolean;
}

export interface WaitlistStatsResponse {
  total: number;
}

export async function joinWaitlist(payload: {
  email: string;
  referrer?: string;
}): Promise<WaitlistJoinResponse> {
  const { data } = await client.post<WaitlistJoinResponse>(
    "/api/waitlist",
    payload
  );
  return data;
}

export async function fetchWaitlistStats(): Promise<WaitlistStatsResponse> {
  const { data } = await client.get<WaitlistStatsResponse>(
    "/api/waitlist/stats"
  );
  return data;
}
