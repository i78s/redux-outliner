import axios from 'axios';

import { fullTrim, removeTrailingSlash } from 'utils/stringHandler';
import { Member } from './models/Member';
import { User } from './models/User';

interface ApiConfig {
  baseURL: string;
  timeout: number;
}

export class GitHubApi {
  private API_CONFIG: ApiConfig;
  private DAFAULT_API_CONFIG: ApiConfig = {
    baseURL: 'https://api.github.com',
    timeout: 1000,
  };

  constructor(config?: ApiConfig) {
    const mergedConfig = {
      ...this.DAFAULT_API_CONFIG,
      ...config,
    };
    this.API_CONFIG = {
      ...mergedConfig,
      baseURL: removeTrailingSlash(mergedConfig.baseURL),
    };
  }

  getOrganizationMembers = async (
    organizationName: string,
  ) => {
    const instance = axios.create(this.API_CONFIG);

    try {
      const response = await instance.get(`/orgs/${organizationName}/members`);

      if (response.status !== 200) {
        throw new Error('Server Error');
      }

      const members: Member[] = response.data;

      return members;
    } catch (err) {
      throw err;
    }
  }

  searchUsers = async(
    query: string,
  ) => {
    const escapedQuery = encodeURIComponent(fullTrim(query));
    const instance = axios.create(this.API_CONFIG);

    try {
      const response = await instance.get(
        `/search/users?q=${escapedQuery}`,
      );
      if (response.status !== 200) {
        throw new Error('Server Error');
      }
      const users: User[] = response.data.items;

      return users;

    } catch (err) {
      throw err;
    }
  }
}
