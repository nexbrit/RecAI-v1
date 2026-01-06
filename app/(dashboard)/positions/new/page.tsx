'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
}

export default function NewPositionPage() {
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [originalJd, setOriginalJd] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [rateRange, setRateRange] = useState('');
  const [ir35Status, setIr35Status] = useState<'inside' | 'outside' | 'unknown'>('unknown');
  const [loading, setLoading] = useState(false);
  const [processingJd, setProcessingJd] = useState(false);
  const [formattedJd, setFormattedJd] = useState('');
  const [decodedJd, setDecodedJd] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
      if (data) setClients(data);
    }
    fetchClients();
  }, []);

  const handleProcessJd = async () => {
    if (!originalJd.trim()) return;

    setProcessingJd(true);
    setError(null);

    const processPromise = (async () => {
      // Format JD
      const formatResponse = await fetch('/api/ai/format-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd: originalJd }),
      });

      if (!formatResponse.ok) throw new Error('Failed to format JD');
      const formatData = await formatResponse.json();
      setFormattedJd(formatData.formattedJd);

      // Decode JD
      const decodeResponse = await fetch('/api/ai/decode-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd: originalJd }),
      });

      if (!decodeResponse.ok) throw new Error('Failed to decode JD');
      const decodeData = await decodeResponse.json();
      setDecodedJd(decodeData.decodedJd);

      // Auto-fill fields from decoded JD
      if (decodeData.decodedJd) {
        if (!title && decodeData.decodedJd.title) {
          setTitle(decodeData.decodedJd.title);
        }
        if (!location && decodeData.decodedJd.location) {
          setLocation(decodeData.decodedJd.location);
        }
        if (!duration && decodeData.decodedJd.duration) {
          setDuration(decodeData.decodedJd.duration);
        }
      }
    })();

    toast.promise(processPromise, {
      loading: 'AI is analyzing your JD...',
      success: 'JD processed successfully!',
      error: (err) => `Failed to process JD: ${err.message}`,
    });

    try {
      await processPromise;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingJd(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const submitPromise = (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: insertError } = await supabase
        .from('positions')
        .insert({
          title,
          client_id: clientId || null,
          original_jd: originalJd,
          formatted_jd: formattedJd || null,
          decoded_jd: decodedJd || null,
          location: location || null,
          duration: duration || null,
          rate_range: rateRange || null,
          ir35_status: ir35Status,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Auto-generate boolean search if we have decoded JD
      if (decodedJd) {
        try {
          const booleanResponse = await fetch('/api/ai/boolean-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobRequirements: decodedJd }),
          });

          if (booleanResponse.ok) {
            const booleanData = await booleanResponse.json();

            // Update position with boolean searches
            await supabase
              .from('positions')
              .update({
                boolean_search_broad: booleanData.broadSearch?.booleanString || null,
                boolean_search_refined: booleanData.refinedSearch?.booleanString || null,
              })
              .eq('id', data.id);
          }
        } catch (booleanError) {
          console.error('Failed to generate boolean search:', booleanError);
          // Don't fail position creation if boolean search fails
        }
      }

      // Log activity
      await supabase.from('activity_log').insert({
        user_id: user.id,
        action: `created position "${title}"`,
        entity_type: 'position',
        entity_id: data.id,
      });

      return data.id;
    })();

    toast.promise(submitPromise, {
      loading: 'Creating position...',
      success: 'Position created successfully!',
      error: (err) => `Failed to create position: ${err.message}`,
    });

    try {
      const positionId = await submitPromise;
      router.push(`/positions/${positionId}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/positions">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Position</h1>
          <p className="text-muted-foreground mt-1">
            Add a new position and let AI analyze the job description
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the position details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Position Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Senior Java Developer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., London (Hybrid)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 6 months"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate Range</Label>
                  <Input
                    id="rate"
                    value={rateRange}
                    onChange={(e) => setRateRange(e.target.value)}
                    placeholder="e.g., £550-650/day"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ir35">IR35 Status</Label>
                <Select value={ir35Status} onValueChange={(v: any) => setIr35Status(v)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unknown">Unknown</SelectItem>
                    <SelectItem value="inside">Inside IR35</SelectItem>
                    <SelectItem value="outside">Outside IR35</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Job Description</CardTitle>
                  <CardDescription>
                    Paste the original JD and let AI format and decode it
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleProcessJd}
                  disabled={!originalJd.trim() || processingJd}
                >
                  {processingJd ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-2" />
                  )}
                  Process with AI
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="original">
                <TabsList>
                  <TabsTrigger value="original">Original JD</TabsTrigger>
                  <TabsTrigger value="formatted" disabled={!formattedJd}>
                    Formatted
                  </TabsTrigger>
                  <TabsTrigger value="decoded" disabled={!decodedJd}>
                    Decoded Requirements
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="original" className="mt-4">
                  <Textarea
                    value={originalJd}
                    onChange={(e) => setOriginalJd(e.target.value)}
                    placeholder="Paste the original job description here..."
                    className="min-h-[300px] font-mono text-sm"
                    required
                  />
                </TabsContent>
                <TabsContent value="formatted" className="mt-4">
                  <div className="border rounded-lg p-4 min-h-[300px] bg-muted/50">
                    <pre className="whitespace-pre-wrap text-sm">{formattedJd}</pre>
                  </div>
                </TabsContent>
                <TabsContent value="decoded" className="mt-4">
                  {decodedJd && (
                    <div className="space-y-4">
                      {/* Summary */}
                      <div>
                        <h4 className="font-medium mb-2">Summary</h4>
                        <p className="text-sm text-muted-foreground">{decodedJd.summary}</p>
                      </div>

                      {/* Must Have Skills */}
                      {decodedJd.must_have_skills?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 text-green-600">Must Have Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {decodedJd.must_have_skills.map((skill: any, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                              >
                                {skill.name}
                                {skill.years_required && ` (${skill.years_required}+ yrs)`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Nice to Have Skills */}
                      {decodedJd.nice_to_have_skills?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 text-blue-600">Nice to Have</h4>
                          <div className="flex flex-wrap gap-2">
                            {decodedJd.nice_to_have_skills.map((skill: any, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                              >
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {decodedJd.experience_required && (
                        <div>
                          <h4 className="font-medium mb-2">Experience Required</h4>
                          <p className="text-sm text-muted-foreground">
                            {decodedJd.experience_required}
                          </p>
                        </div>
                      )}

                      {/* Responsibilities */}
                      {decodedJd.responsibilities?.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Key Responsibilities</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {decodedJd.responsibilities.map((resp: string, i: number) => (
                              <li key={i}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/positions">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading || !title.trim() || !originalJd.trim()}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Position
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
