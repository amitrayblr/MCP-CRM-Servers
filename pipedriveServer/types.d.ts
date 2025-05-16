declare module 'pipedrive' {
  export class ApiClient {
    basePath: string;
    authentications: {
      api_key: {
        type: string;
        in: string;
        name: string;
        apiKey: string;
      };
      basic_authentication: {
        type: string;
      };
      oauth2: {
        type: string;
        accessToken: string;
      };
    };
    defaultHeaders: Record<string, string>;
    timeout: number;
    constructor();
  }

  export class PersonsApi {
    constructor(apiClient: ApiClient);
    getPersons(): Promise<any>;
    getPerson(params: { id: number }): Promise<any>;
    searchPersons(params: { term: string }): Promise<any>;
  }

  export class OrganizationsApi {
    constructor(apiClient: ApiClient);
    getOrganizations(): Promise<any>;
    getOrganization(params: { id: number }): Promise<any>;
    searchOrganizations(params: { term: string }): Promise<any>;
  }

} 