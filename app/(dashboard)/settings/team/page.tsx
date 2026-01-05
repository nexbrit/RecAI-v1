import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Mail } from 'lucide-react';

export default async function TeamSettingsPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    account_manager: 'bg-blue-100 text-blue-800',
    recruiter: 'bg-green-100 text-green-800',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team and their roles
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team ({users?.length || 0})</CardTitle>
          <CardDescription>
            People with access to this workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user: any) => {
                const initials = user.full_name
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .toUpperCase() || user.email[0].toUpperCase();

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.full_name || 'Unnamed'}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={roleColors[user.role] || 'bg-gray-100 text-gray-800'}>
                        {user.role?.replace('_', ' ')}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No team members yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
