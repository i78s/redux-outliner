declare module '*.svg'
declare module '*.json' {
  const value: any;
  export default value;
}

interface InputEvent<T extends HTMLElement> extends Event {
  target: T;
}

interface FluxStandardAction {
  type: string;
  payload: object;
  meta?: object;
  error: boolean;
}
