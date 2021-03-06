declare module '*.json' {
  const value: any;
  export default value;
}

interface HTMLElementEvent<T extends HTMLElement> extends Event {
  target: T;
}

interface FluxStandardAction {
  type: string;
  payload: object;
  meta?: object;
  error: boolean;
}
