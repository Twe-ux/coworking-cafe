'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Calculator } from 'lucide-react'

export default function AccountingPage() {
  return (
    <div className="space-y-8">
      {/* Header avec toggle sidebar et breadcrumb */}
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Comptabilité</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="px-4">
        <h1 className="text-2xl font-bold mb-6">Comptabilité</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/accounting/cash-control">
            <Button
              variant="outline"
              className="h-32 w-full flex flex-col gap-2 hover:bg-accent"
            >
              <Calculator className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold">Contrôle de Caisse</span>
              <span className="text-sm text-muted-foreground">Gestion des encaissements quotidiens</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
