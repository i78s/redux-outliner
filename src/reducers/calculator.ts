import * as actions from 'actions';
import { reducerWithInitialState } from 'typescript-fsa-reducers';

const initialAppState = {
  inputValue: 0,
  resultValue: 0,
  showingResult: false,
};

const calculator = reducerWithInitialState(initialAppState).case(
  actions.onNumClick,
  (state, { value }) => ({
    ...state,
    inputValue: state.inputValue * 10 + value,
    howingResult: false,
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

// const calculator = (state = initialAppState, action: any) => {
//   if (action.type === actionTypes.INPUT_NUMBER) {
//     return {
//       ...state,
//       inputValue: state.inputValue * 10 + action.number,
//       showingResult: false,
//     };
//   } else if (action.type === actionTypes.PLUS) {
//     return {
//       ...state,
//       inputValue: 0,
//       resultValue: state.resultValue + state.inputValue,
//       showingResult: true,
//     };
//   } else {
//     return state;
//   }
// };

export default calculator;
