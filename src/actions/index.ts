import * as actionTypes from 'constants/action-types';
import actionCreatorFactory from 'typescript-fsa';

const actionCreator = actionCreatorFactory('COUNTER');

export const onNumClick = actionCreator<{
  value: number,
}>(actionTypes.INPUT_NUMBER);

export const onPlusClick = actionCreator(actionTypes.PLUS);
