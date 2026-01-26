import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LessonProgress {
  completed: boolean;
  completedAt?: string;
  attempts: number;
}

interface ProgressState {
  lessons: Record<string, LessonProgress>;
  markComplete: (lessonId: string) => void;
  incrementAttempt: (lessonId: string) => void;
  isComplete: (lessonId: string) => boolean;
  reset: () => void;
}

const defaultProgress: LessonProgress = {
  completed: false,
  attempts: 0,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      lessons: {},

      markComplete: (lessonId) =>
        set((state) => {
          const existing = state.lessons[lessonId] ?? defaultProgress;
          return {
            lessons: {
              ...state.lessons,
              [lessonId]: {
                ...existing,
                completed: true,
                completedAt: new Date().toISOString(),
              },
            },
          };
        }),

      incrementAttempt: (lessonId) =>
        set((state) => {
          const existing = state.lessons[lessonId] ?? defaultProgress;
          return {
            lessons: {
              ...state.lessons,
              [lessonId]: {
                ...existing,
                attempts: existing.attempts + 1,
              },
            },
          };
        }),

      isComplete: (lessonId) => get().lessons[lessonId]?.completed ?? false,

      reset: () => set({ lessons: {} }),
    }),
    {
      name: "learnpython-progress",
    }
  )
);
