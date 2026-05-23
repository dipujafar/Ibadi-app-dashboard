import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const clientReviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllClientReviews: builder.query({
      query: (queries) => ({
        url: "/client-review",
        method: "GET",
        params: queries,
      }),
      providesTags: [tagTypes.clientReviews],
    }),

    createClientReview: builder.mutation({
      query: (data) => ({
        url: "/client-review",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.clientReviews],
    }),

    updateClientReview: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/client-review/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.clientReviews],
    }),

    deleteClientReview: builder.mutation({
      query: (id) => ({
        url: `/client-review/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.clientReviews],
    }),
  }),
});

export const {
  useGetAllClientReviewsQuery,
  useCreateClientReviewMutation,
  useUpdateClientReviewMutation,
  useDeleteClientReviewMutation,
} = clientReviewsApi;