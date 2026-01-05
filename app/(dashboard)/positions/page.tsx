import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, MapPin, Clock, Building2 } from 'lucide-react';
import Link from 'next/link';

export default async function PositionsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  const supabase = await createClient();
  const status = searchParams.status || 'all';
  const search = searchParams.search || '';

  let query = supabase
    .from('positions')
    .select(`
      *,
      client:clients(id, name, industry),
      applications:applications(count)
    `)
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data: positions, error } = await query;

  const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'destructive'> = {
    active: 'success',
    on_hold: 'warning' as any,
    filled: 'default',
    cancelled: 'destructive',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Positions</h1>
          <p className="text-muted-foreground mt-1">
            Manage your job positions and track candidate pipelines
          </p>
        </div>
        <Link href="/positions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Position
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search positions..."
                  defaultValue={search}
                  className="pl-10"
                />
              </div>
            </div>
            <Select name="status" defaultValue={status}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="filled">Filled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Filter</Button>
          </form>
        </CardContent>
      </Card>

      {/* Positions Grid */}
      {positions && positions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {positions.map((position: any) => (
            <Link key={position.id} href={`/positions/${position.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{position.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {position.client?.name || 'No client'}
                      </CardDescription>
                    </div>
                    <Badge variant={statusColors[position.status] || 'default'}>
                      {position.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {position.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {position.location}
                        </span>
                      )}
                      {position.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {position.duration}
                        </span>
                      )}
                    </div>
                    {position.rate_range && (
                      <p className="text-sm font-medium">{position.rate_range}</p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        {position.applications?.[0]?.count || 0} applications
                      </span>
                      {position.ir35_status !== 'unknown' && (
                        <Badge variant="outline" className="text-xs">
                          {position.ir35_status === 'inside' ? 'Inside IR35' : 'Outside IR35'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No positions found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {search || status !== 'all'
                ? 'Try adjusting your filters to find positions'
                : 'Get started by creating your first position'}
            </p>
            <Link href="/positions/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Position
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
