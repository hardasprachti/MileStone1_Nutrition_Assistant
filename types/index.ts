export type Claim = {
  claim_text: string;
  source: null;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  claims?: Claim[];
  createdAt: number;
};
