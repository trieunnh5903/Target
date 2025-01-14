import { all } from "redux-saga/effects";
import { watchAuthSaga } from "./authSaga";
import { watchPostSaga } from "./postSaga";

export default function* rootSaga() {
  yield all([watchAuthSaga(), watchPostSaga()]);
}
