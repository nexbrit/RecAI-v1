import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';

export default async function SkillMapperPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string };
}) {
  const supabase = await createClient();
  const search = searchParams.search || '';
  const category = searchParams.category || '';

  let query = supabase
    .from('skills')
    .select('*')
    .order('name');

  if (search) {
    query = query.or(`name.ilike.%${search}%,aliases.cs.{${search}}`);
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data: skills } = await query.limit(100);

  // Get unique categories
  const { data: categories } = await supabase
    .from('skills')
    .select('category')
    .not('category', 'is', null);

  const uniqueCategories = Array.from(new Set(categories?.map((c) => c.category))).filter(Boolean);

  const categoryColors: Record<string, string> = {
    programming_language: 'bg-blue-100 text-blue-800',
    framework: 'bg-purple-100 text-purple-800',
    database: 'bg-green-100 text-green-800',
    cloud: 'bg-orange-100 text-orange-800',
    devops: 'bg-red-100 text-red-800',
    methodology: 'bg-yellow-100 text-yellow-800',
    soft_skill: 'bg-pink-100 text-pink-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills Taxonomy</h1>
          <p className="text-muted-foreground mt-1">
            Manage your skills database for consistent matching
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <form className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search skills..."
                defaultValue={search}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <a href="/tools/skill-mapper">
                <Button variant={!category ? 'default' : 'outline'} type="button">
                  All
                </Button>
              </a>
              {uniqueCategories.slice(0, 5).map((cat) => (
                <a key={cat} href={`/tools/skill-mapper?category=${cat}`}>
                  <Button
                    variant={category === cat ? 'default' : 'outline'}
                    type="button"
                    className="capitalize"
                  >
                    {cat?.replace('_', ' ')}
                  </Button>
                </a>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Skills Grid */}
      {skills && skills.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill: any) => (
            <Card key={skill.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{skill.name}</CardTitle>
                  {skill.category && (
                    <Badge className={categoryColors[skill.category] || 'bg-gray-100 text-gray-800'}>
                      {skill.category.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                {skill.description && (
                  <CardDescription>{skill.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {skill.aliases && skill.aliases.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Aliases</p>
                    <div className="flex flex-wrap gap-1">
                      {skill.aliases.map((alias: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {alias}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {skill.is_current ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Current
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Legacy
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No skills found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {search
                ? 'Try adjusting your search'
                : 'Start by adding skills to your taxonomy'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Skill
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
