export type HistoryItem = {
  id: string;
  timestamp: string;
  source: string;
  output: string;
};

export type AccountProfile = {
  email: string;
  profile: string;
  phone: string;
  history: string[];
};
