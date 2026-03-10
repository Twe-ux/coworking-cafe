import { Metadata } from 'next'
import OrderEditClient from './OrderEditClient'

export const metadata: Metadata = {
  title: 'Modifier Commande | Admin',
  description: 'Modifier une commande fournisseur',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrderEditPage({ params }: PageProps) {
  const { id } = await params

  return <OrderEditClient id={id} />
}
