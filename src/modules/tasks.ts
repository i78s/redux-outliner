import { nodesTask } from 'modules/nodes/sagas';
import { all, fork } from 'redux-saga/effects';

export default function* rootTask() {
  yield all([
    fork(nodesTask),
  ]);
}
