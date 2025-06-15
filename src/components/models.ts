export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface QuestionItem {
  id: number;
  num1: number;
  operator: string;
  num2: number;
  wrong_answer: number | null;
  next: Date | null;
  correct_count: number; // 答对次数
}

export interface CalculateSettings {
  minNumber: number;
  maxNumber: number;
  operators: string[];
  checkDelay: number;
  difficultyLevel: string;
  showAnimation: boolean;
  soundEffects: boolean;
  gameMode: boolean; // 游戏模式开关
  targetScore: number; // 目标分数/题数
  autoFocus: boolean; // 自动聚焦输入框
}

export interface GameStats {
  level: number; // 当前关卡
  streak: number; // 连续答对次数
  maxStreak: number; // 最大连续答对次数
  stars: number; // 获得的星星数
  achievements: string[]; // 已获得的成就
}
