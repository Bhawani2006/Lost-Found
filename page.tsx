import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { ItemCard } from '@/components/item-card'
import { BrowseFilters } from '@/components/browse-filters'
import { Search } from 'lucide-react'
import type { Item } from '@/lib/types'

export const metadata = {
  title: 'Browse Items - Campus Lost & Found',
  description: 'Browse lost and found items on campus.',
}

interface PageProps {
  searchParams: Promise<{
    type?: string
    category?: string
    location?: string
    search?: string
  }>
}

async function ItemsGrid({ searchParams }: { searchParams: PageProps['searchParams'] }) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('items')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (params.type && params.type !== 'all') {
    query = query.eq('type', params.type)
  }

  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category)
  }

  if (params.location && params.location !== 'all') {
    query = query.eq('location', params.location)
  }

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  const { data: items } = await query

  if (!items || items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 py-16 text-center">
        <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No items found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try adjusting your filters or search term.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {(items as Item[]).map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}

export default async function BrowsePage({ searchParams }: PageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Browse Items</h1>
            <p className="mt-2 text-muted-foreground">
              Search through lost and found items on campus
            </p>
          </div>

          <BrowseFilters />

          <div className="mt-8">
            <Suspense
              fallback={
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-64 animate-pulse rounded-lg bg-muted"
                    />
                  ))}
                </div>
              }
            >
              <ItemsGrid searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
