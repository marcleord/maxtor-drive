import { DataProvider } from "@refinedev/core";
import { axiosInstance, generateSort, generateFilter } from "./utils";
import axios, { AxiosInstance } from "axios";
import queryString from "query-string";
import { TOKEN_KEY } from "../authProvider";

const stringify = queryString.stringify

type MethodTypes = "get" | "delete" | "head" | "options";
type MethodTypesWithBody = "post" | "put" | "patch";

export const getFileURL = (filename?: string | null): string => {
  if(!filename) return ""
  if(filename.startsWith("http")) return filename
  return import.meta.env.VITE_PUBLIC_STATICFILES_URL + "/" + filename
}


export const getAuthHeaders = (): { [key: string]: string } => {
  const token: string = localStorage.getItem(TOKEN_KEY) || ""
  try {
    const data = JSON.parse(token)
    return {
      "Authorization": data?.token_type + " " + data?.access_token
    }
  } catch(err)  {
    return {}
  }
}

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL,
  headers: getAuthHeaders()
})

export const dataProvider = (
  apiUrl: string,
  httpClient: AxiosInstance = axiosInstance
): Omit<
  Required<DataProvider>,
  "createMany" | "updateMany" | "deleteMany"
> => ({
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const url = `${apiUrl}/${resource}`;

    const { current = 1, pageSize = 10, mode = "server" } = pagination ?? {};

    const { headers: headersFromMeta, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    const queryFilters = generateFilter(filters);

    const query: {
      skip?: number;
      limit?: number;
      _sort?: string;
      _order?: string;
    } = {};

    if (mode === "server") {
      query.skip = (current - 1) * pageSize;
      query.limit = current * pageSize;
    }

    const generatedSort = generateSort(sorters);
    if (generatedSort) {
      const { _sort, _order } = generatedSort;
      query._sort = _sort.join(",");
      query._order = _order.join(",");
    }

    const { data, headers } = await httpClient[requestMethod](
      `${url}/?${stringify(query)}&${stringify(queryFilters)}`,
      {
        headers: {
          ...getAuthHeaders(),
          ...headersFromMeta
        },
      }
    );

    const total = data.total
    // const total = headers["content-length"];
    // console.log(data, "OUT OF ", total, headers)
    // const total = data.total
    return {
      data: data.data,
      total: total,
    };
  },

  getMany: async ({ resource, ids, meta }) => {
    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    const { data } = await httpClient[requestMethod](
      `${apiUrl}/${resource}/?${stringify({ ids })}`, { 
        headers: {
          ...getAuthHeaders(),
          ...headers
        } 
      }
    );

    return {
      data: data.data,
      total: data.total,
    };
  },

  create: async ({ resource, variables, meta }) => {
    const url = `${apiUrl}/${resource}/`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "post";

    const { data } = await httpClient[requestMethod](url, variables, {
      headers: {
        ...getAuthHeaders(),
        ...headers
      }
    });

    return {
      data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}/`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "put";

    const { data } = await httpClient[requestMethod](url, variables, {
      headers: {
        ...getAuthHeaders(),
        ...headers
      }
    });

    return {
      data,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `${apiUrl}/${resource}/${id}/`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    const { data } = await httpClient[requestMethod](url, { 
      headers: {
        ...getAuthHeaders(),
        ...headers
      }
    });

    return {
      data,
    };
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}/`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "delete";

    const { data } = await httpClient[requestMethod](url, {
      data: variables,
      headers: {
        ...getAuthHeaders(),
        ...headers
      }
    });

    return {
      data,
    };
  },

  getApiUrl: () => {
    return apiUrl;
  },

  custom: async ({
    url,
    method,
    filters,
    sorters,
    payload,
    query,
    headers,
    meta
  }) => {
    let requestUrl = url.startsWith("/") ? `${apiUrl}${url}?` : `${url}?`;

    if (sorters) {
      const generatedSort = generateSort(sorters);
      if (generatedSort) {
        const { _sort, _order } = generatedSort;
        const sortQuery = {
          _sort: _sort.join(","),
          _order: _order.join(","),
        };
        requestUrl = `${requestUrl}&${stringify(sortQuery)}`;
      }
    }

    if (filters) {
      const filterQuery = generateFilter(filters);
      requestUrl = `${requestUrl}&${stringify(filterQuery)}`;
    }

    if (query) {
      requestUrl = `${requestUrl}&${stringify(query)}`;
    }
    
    if(meta?.useDefaultAuthCredentials) {
      headers = {
        ...headers,
        ...getAuthHeaders()
      }
    }
    let axiosResponse;
    switch (method) {
      case "put":
      case "post":
      case "patch":
        axiosResponse = await httpClient[method](url, payload, {
          headers,
        });
        break;
      case "delete":
        axiosResponse = await httpClient.delete(url, {
          data: payload,
          headers: headers,
        });
        break;
      default:
        axiosResponse = await httpClient.get(requestUrl, {
          headers,
        });
        break;
    }

    const { data } = axiosResponse;

    return Promise.resolve({ data });
  },
});
