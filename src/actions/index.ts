import * as actionTypes from 'constants/action-types';

export const onNumClick = (value: number) => ({
  type: actionTypes.INPUT_NUMBER,
  number: value,
});

export const onPlusClick = () => ({
  type: actionTypes.PLUS,
});
