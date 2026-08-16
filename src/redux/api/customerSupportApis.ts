import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const customerSupportApis = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomerSupport: builder.query({
      query: (params) => ({
        url: "/support-message",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.support],
    }),
    deleteCustomerSupport: builder.mutation({
      query: (id) => ({
        url: `/support-message/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.support],
    }),
  }),
});

export const { useGetCustomerSupportQuery, useDeleteCustomerSupportMutation } =
  customerSupportApis;
