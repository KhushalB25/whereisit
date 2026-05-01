import { EditItemClient } from "@/components/items/EditItemClient";

export const metadata = {
  title: "Edit Item"
};

export default async function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditItemClient itemId={id} />;
}
