import { all, fork } from 'redux-saga/effects';

import { nodesTask } from 'modules/nodes/sagas';

export default function* rootTask() {
  yield all([fork(nodesTask)]);
}
