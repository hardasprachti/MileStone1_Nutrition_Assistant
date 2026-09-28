// tests/questions.ts
// Fixed 10-question suite. Run ALL of these after every system prompt change.
// Log results in docs/failureLog.md — do not skip any question.

export type QuestionCategory =
  | "nutrients"
  | "food-safety"
  | "cooking"
  | "unclear";

export type TestQuestion = {
  id: number;
  category: QuestionCategory;
  q: string;
};

export const QUESTIONS: TestQuestion[] = [
  // Nutrient requirements
  { id: 1, category: "nutrients",   q: "How much iron does an adult woman need per day?" },
  { id: 2, category: "nutrients",   q: "What is the recommended daily vitamin D intake for adults?" },
  { id: 3, category: "nutrients",   q: "How much protein does a vegetarian adult need?" },

  // Food safety and storage
  { id: 4, category: "food-safety", q: "How long can cooked chicken stay in the fridge?" },
  { id: 5, category: "food-safety", q: "At what temperature should beef be cooked to be safe?" },
  { id: 6, category: "food-safety", q: "Is it safe to refreeze meat that has been thawed?" },

  // Cooking methods
  { id: 7, category: "cooking",     q: "Does boiling vegetables destroy their nutrients?" },
  { id: 8, category: "cooking",     q: "What is the healthiest way to cook fish?" },

  // Questions where nobody has a clear answer
  { id: 9,  category: "unclear",    q: "Is coffee good or bad for your health?" },
  { id: 10, category: "unclear",    q: "Are eggs healthy to eat every day?" },
];
