import { tagTypes } from "../tagTypes";
import { baseApi } from "./baseApi";

const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategories: builder.query({
      query: (queries) => ({
        url: "/categories",
        method: "GET",
        params: queries,
      }),
      providesTags: [tagTypes.categories],
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: `/categories`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.categories],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.categories],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.categories],
    }),
    createSubcategory: builder.mutation({
      query: (data) => ({
        url: `/subcategories`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.categories],
    }),
    getSubcategories: builder.query({
      query: (queries) => ({
        url: "/subcategories",
        method: "GET",
        params: queries,
      }),
      providesTags: [tagTypes.categories],
    }),
    updateSubcategory: builder.mutation({
      query: (data) => ({
        url: `/subcategories/${data?.id}`,
        method: "PATCH",
        body: data?.data,
      }),
      invalidatesTags: [tagTypes.categories],
    }),
    deleteSubcategory: builder.mutation({
      query: (id) => ({
        url: `/subcategories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.categories],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateSubcategoryMutation,
  useGetSubcategoriesQuery,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
} = contentApi;
