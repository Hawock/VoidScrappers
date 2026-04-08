import { Ref } from "../reactivity";

export interface ExecutorExecOptions {
  loading?: Ref<boolean> | { loading: Ref<number[] | string[]>; loadingId: number | string };
  success_message?: string;
  returnErrors?: boolean;
}
