import Api from "./Api";

export class BaseApiService {
  api: Api;

  constructor() {
    this.api = Api.createApi();
  }
}
