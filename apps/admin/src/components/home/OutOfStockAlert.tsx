'use client';

import { useState } from 'react';
import { Check, ChevronsUpDown, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Product {
  _id: string;
  name: string;
  currentStock: number;
  category: string;
}

export function OutOfStockAlert() {
  const [open, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const queryClient = useQueryClient();

  // Fetch active products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products', 'active'],
    queryFn: async () => {
      const res = await fetch('/api/inventory/products?isActive=true');
      if (!res.ok) throw new Error('Failed to fetch products');
      const result = await res.json();
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Report out of stock mutation
  const reportMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch('/api/inventory/report-out-of-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to report out of stock');
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`Rupture de stock signalée : ${data.productName}`);
      setSelectedProductId('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors du signalement');
    },
  });

  const selectedProduct = products.find((p) => p._id === selectedProductId);

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="flex-1 justify-between"
              >
                {selectedProduct
                  ? selectedProduct.name
                  : "Sélectionner un produit..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Rechercher un produit..." />
                <CommandList>
                  <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                  <CommandGroup>
                    {products.map((product) => (
                      <CommandItem
                        key={product._id}
                        value={product.name}
                        onSelect={() => {
                          setSelectedProductId(product._id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedProductId === product._id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Stock : {product.currentStock} • {product.category}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            onClick={() => selectedProductId && reportMutation.mutate(selectedProductId)}
            disabled={!selectedProductId || reportMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700 shrink-0"
          >
            {reportMutation.isPending ? 'Signalement...' : 'Signaler rupture'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
