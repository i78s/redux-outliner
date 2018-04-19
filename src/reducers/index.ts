import { calculator, CalculatorState } from 'reducers/calculator';
import { combineReducers } from 'redux';

export interface State {
  calculator: CalculatorState;
}

const reducer = combineReducers({
  calculator,
});

export default reducer;
