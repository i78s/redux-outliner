import * as actions from 'actions';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

export interface CalculatorState {
  inputValue: number;
  resultValue: number;
  showingResult: boolean;
}

const initialAppState: CalculatorState = {
  inputValue: 0,
  resultValue: 0,
  showingResult: false,
};

export const calculator = reducerWithInitialState(initialAppState).case(
  actions.onNumClick,
  (state, value) => ({
    ...state,
    inputValue: state.inputValue * 10 + value,
    showingResult: false,
  }),
).case(
  actions.onPlusClick,
  (state) => ({
    ...state,
    inputValue: 0,
    resultValue: state.resultValue + state.inputValue,
    showingResult: true,
  }),
);
