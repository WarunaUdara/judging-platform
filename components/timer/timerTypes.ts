export interface TimerConfig {
  eventTitle: string;
  subtitle: string;
  targetSeconds: number;
  clockStyle: ClockStyle;
  titleStyle: TextStyle;
  subtitleStyle: TextStyle;
  alarmConfig: AlarmConfig;
  backgroundType: "default" | "image" | "video";
  backgroundMediaKey: string | null;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: "normal" | "bold";
}

export type ClockStyle = TextStyle;

export interface AlarmConfig {
  type: OscillatorType;
  frequency: number;
  duration: number;
  volume: number;
  pattern: AlarmPattern;
}

export type AlarmPattern =
  | "beep-beep"
  | "continuous"
  | "escalating"
  | "siren"
  | "triple-beep";

export type AppPhase = "setup" | "running";

export interface StoredMediaMeta {
  name: string;
  size: number;
  type: string;
}
