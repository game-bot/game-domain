const debug = require("debug")("gamebot:api");

import {
  BaseApiClient,
  GameApiRequestParams,
  GameApiResponse
} from "./base-api-client";
import { IApiClientRepository } from "../repositories/api-client-repository";
import { IDictionary } from "@gamebot/domain";
import { Player } from "../entities/player";
import { GamebotApiDataError } from "../errors";

export type ApiEndpointCacheInfo = {
  key: string;
  ttl?: number;
};

export abstract class ApiCient<
  ENDPOINT extends string = string
> extends BaseApiClient {
  constructor(
    protected _repository: IApiClientRepository,
    defaultHeaders?: IDictionary<string>
  ) {
    super(defaultHeaders);
  }

  async endpoint<DATA>(
    endpoint: ENDPOINT,
    player: Player,
    url: string,
    params: GameApiRequestParams,
    authData?: any
  ): Promise<GameApiResponse<DATA>> {
    debug(`start api endpoint ${endpoint}`);
    const cacheInfo = this.getEndpointCacheInfo(endpoint, player, url, params);
    if (cacheInfo) {
      const cacheData = await this._repository.get<GameApiResponse<DATA>>(
        cacheInfo.key
      );
      if (cacheData !== null) {
        debug(`Got data from cache for api endpoint ${endpoint}`);
        return cacheData;
      }
    }
    // get from the network
    authData = !!authData ? authData : await this.authenticate(player);
    const response = await this.httpRequest(url, params, authData);

    if (response.error) {
      throw response.error;
    }

    try {
      response.data = this.mapEndpointData<DATA>(endpoint, response, player);
    } catch (e) {
      response.ok = false;
      response.error = new GamebotApiDataError(e.message, {
        data: response.data
      });
      return response;
    }

    if (cacheInfo) {
      await this._repository.put(cacheInfo.key, response, cacheInfo.ttl);
    }

    return response;
  }

  protected abstract mapEndpointData<DATA>(
    endpoint: ENDPOINT,
    response: GameApiResponse,
    player: Player
  ): DATA;
  protected abstract getEndpointCacheInfo(
    endpoint: ENDPOINT,
    player: Player,
    url: string,
    params: GameApiRequestParams
  ): ApiEndpointCacheInfo | null;
}
