import InventoryEntryClient from './InventoryEntryClient'

export default async function InventoryEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <InventoryEntryClient id={id} />
}
