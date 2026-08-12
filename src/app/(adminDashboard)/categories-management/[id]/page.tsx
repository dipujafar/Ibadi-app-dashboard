import React from "react";
import SubcategoriesContainer from "./_components/SubcategoriesContainer";

export default async function SubcategoriesPage({
  params,
}: {
  params: { id: string };
}) {
  return <SubcategoriesContainer id={params.id} />;
}
