import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const packageApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getPackages: build.query({
            query: () => ({
                url: "/packages",
                method: "GET",
            }),
            providesTags: [tagTypes.packages],
        }),
        getPackage: build.query({
            query: (id) => ({
                url: `/packages/${id}`,
                method: "GET",
            }),
            providesTags: [tagTypes.packages],
        }),
        createPackage: build.mutation({
            query: (data) => ({
                url: "/packages",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [tagTypes.packages],
        }),
        updatePackage: build.mutation({
            query: ({ id, ...data }) => ({
                url: `/packages/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: [tagTypes.packages],
        }),
        deletePackage: build.mutation({
            query: (id) => ({
                url: `/packages/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [tagTypes.packages],
        }),
    }),
})

export const { useGetPackagesQuery, useGetPackageQuery, useCreatePackageMutation, useUpdatePackageMutation, useDeletePackageMutation } = packageApi