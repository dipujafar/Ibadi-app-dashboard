import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const webContentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getWebContent: builder.query({
            query: () => ({
                url: "/contents/web-about-us",
                method: "GET",
            }),
            providesTags: [tagTypes.webContent],
        }),
        updateContent: builder.mutation({
            query: (data) => ({
                url: `/contents/web-about-us/${data.id}`,
                method: "PATCH",
                body: data.data,
            }),
            invalidatesTags: [tagTypes.webContent],
        }),
    }),
});

export const { useGetWebContentQuery, useUpdateContentMutation } = webContentApi;
