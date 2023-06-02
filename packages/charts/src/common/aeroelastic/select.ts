/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ActionId, Json, PlainFun, Resolve, Selector, State } from '.';

/** @internal */
export const select = (fun: PlainFun): Selector => (...fns: Resolve[]) => {
  let prevId: ActionId = NaN;
  let cache: Json = null;
  const old = (object: State): boolean => prevId === (prevId = object.primaryUpdate.payload.uid);
  return (obj: State) => (old(obj) ? cache : (cache = fun(...fns.map((f) => f(obj)))));
};
