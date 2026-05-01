import { ItemForm } from "@/components/items/ItemForm";

export const metadata = {
  title: "Add Item"
};

export default async function NewItemPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  return <ItemForm mode={type === "expiry" ? "expiry" : type === "wishlist" ? "wishlist" : "location"} />;
}
