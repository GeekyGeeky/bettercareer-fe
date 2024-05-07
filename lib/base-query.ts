import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

import { API_URL } from './config';

export type BaseQueryFnType = <
	ResultType,
	ErrorType,
	QueryFnType extends (...args: any[]) => any,
>(
	queryFn: QueryFnType
) => Promise<{ data?: ResultType; error?: ErrorType }>;

/**
 * A base query function for `react-query` that uses `axios` to make requests.
 * @param baseUrl The base URL to use for all requests.
 * @returns A base query function for `react-query`.
 *
 * @example
 * ```ts
 * import { useQuery } from 'react-query';
 * import { axiosBaseQuery } from './blackAxios';
 *
 * const baseQueryFn = axiosBaseQuery();
 *
 * function useUserQuery() {
 *  return useQuery('user', () => baseQueryFn({ url: '/user' }));
 * }
 */
export const axiosBaseQuery = <ResultType, ErrorType>(
	baseUrl = API_URL!
): BaseQueryFnType =>
	async function axiosBaseQuery<
		ResultType,
		ErrorType,
		QueryFnType extends AxiosRequestConfig & { body?: any; token?: string },
	>(queryFn: QueryFnType): Promise<{ data?: ResultType; error?: ErrorType }> {
		try {
			const {
				url,
				method,
				data,
				body,
				params,
				headers,
				token: __,
			} = queryFn as AxiosRequestConfig & { body?: any; token?: string };
			const token = __ ?? Cookies?.get('bc_token');

			const result = await axios({
				url: baseUrl + url,
				method,
				data: body || data,
				params,
				headers: {
					'Content-Type': 'application/json',
					...headers,
					...(token && {
						Authorization: `Bearer ${token}`,
					}),
				},
			});

			return result.data;
		} catch (axiosError) {
			const err = axiosError as AxiosError<ErrorType>;
			throw err?.response?.data || err;
		}
	};

export const baseQueryFn = axiosBaseQuery(API_URL) as BaseQueryFnType;
