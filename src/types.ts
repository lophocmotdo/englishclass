export interface Session {
  id: number;
  date: string;
  day: string;
  time: string;
  meetLink: string;
  topic: string;
  docLink: string;
  docLink2?: string;
  done: boolean;
}
