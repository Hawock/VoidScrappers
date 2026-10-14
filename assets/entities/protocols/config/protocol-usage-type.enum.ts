export enum PROTOCOL_USAGE_TYPE {
  NORMAL = "NORMAL",    // Обычный: уходит в сброс после использования
  EXHAUST = "EXHAUST",   // Сгорает: удаляется из боя после использования
  UNSTABLE = "UNSTABLE",  // Эфемерный: сгорает в конце хода, если не разыгран
  EMERGENCY = "EMERGENCY" // Утиль: можно сбросить из руки ради бонуса
}