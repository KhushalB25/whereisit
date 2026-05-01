import { ItemDetailClient } from "@/components/items/ItemDetailClient";

export const metadata = {
  title: "Item Detail"
};

export default async function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ItemDetailClient itemId={id} />;
}
