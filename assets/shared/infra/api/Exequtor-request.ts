import type { AxiosResponse } from "axios";
import { Ref } from "../reactivity";
import { NOTIFICATION_SEVERITIES, useNotifications } from "../notifications";
import { SERVER_STATUS } from "./server-statuses.enum";
import { ExecutorExecOptions } from "./exequtor-exec-options";


export class ExecutorRequest {
  public prevContext: string = "";
  public hashRequest: string = "";

  private static notifications: ReturnType<typeof useNotifications> = useNotifications();

  private static setLoading(
    loadingState: boolean,
    loadingValue?: Ref<boolean> | { loading: Ref<(string | number)[]>; loadingId: string | number | (string | number)[] }
  ) {
    if (!loadingValue) return null;
    if ("value" in loadingValue) {
      loadingValue.value = loadingState;
      return;
    } 
    const { loading, loadingId } = loadingValue;
    const idsToProcess = Array.isArray(loadingId) ? loadingId : [loadingId];

    if (loadingState) {
      loading.value = [...loading.value, ...idsToProcess];
    } else {
      const idsSet = new Set(idsToProcess);
      loading.value = loading.value.filter((i) => !idsSet.has(i));
    }
  }

  private static notify(success_message: string) {
    this.notifications.addNotification(success_message, NOTIFICATION_SEVERITIES.Success);
  }

  private static processResponse(response: AxiosResponse, options?: ExecutorExecOptions) {
    if (SERVER_STATUS.OK.includes(Number(response.status))) {
      if (options?.success_message) {
        this.notify(options.success_message);
      }
      return response.data;
    }
    if (options?.returnErrors) return response;
    return false;
  }

  public static async exec<T>(
    callback: Function,
    options?: ExecutorExecOptions
  ): Promise<boolean | any> {
    this.setLoading(true, options?.loading);
    let response;
    try {
      response = await callback();
      return this.processResponse(response, options);
    } catch (e: any) {

      console.log("ERROR:", e);
      return false;
    } finally {
      this.setLoading(false, options?.loading);
    }
  }
}
