'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Copy, CheckCircle } from 'lucide-react';

export default function BooleanGeneratorPage() {
  const [requirements, setRequirements] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!requirements.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/boolean-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobRequirements: requirements }),
      });

      if (!response.ok) throw new Error('Failed to generate boolean search');

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Boolean Search Generator</h1>
        <p className="text-muted-foreground mt-1">
          Generate LinkedIn and job board boolean search strings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle>Job Requirements</CardTitle>
            <CardDescription>
              Paste the job requirements or decoded JD
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Paste job requirements, skills list, or JD here..."
              className="min-h-[300px] font-mono text-sm"
            />
            <Button
              onClick={handleGenerate}
              disabled={!requirements.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Generate Boolean Search
            </Button>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Output */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Broad Search */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">Broad Search (50-70% match)</CardTitle>
                    <CardDescription>Cast a wider net</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.broadSearch, 'broad')}
                  >
                    {copiedField === 'broad' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg">
                    {result.broadSearch}
                  </pre>
                </CardContent>
              </Card>

              {/* Refined Search */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">Refined Search (70-100% match)</CardTitle>
                    <CardDescription>Highly targeted results</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.refinedSearch, 'refined')}
                  >
                    {copiedField === 'refined' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg">
                    {result.refinedSearch}
                  </pre>
                </CardContent>
              </Card>

              {/* LinkedIn Filters */}
              {result.linkedInFilters && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Suggested LinkedIn Filters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {result.linkedInFilters.titles?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Job Titles</p>
                        <div className="flex flex-wrap gap-1">
                          {result.linkedInFilters.titles.map((t: string, i: number) => (
                            <Badge key={i} variant="outline">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.linkedInFilters.industries?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Industries</p>
                        <div className="flex flex-wrap gap-1">
                          {result.linkedInFilters.industries.map((t: string, i: number) => (
                            <Badge key={i} variant="outline">{t}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Tips */}
              {result.searchTips?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Search Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {result.searchTips.map((tip: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary">*</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Boolean search strings will appear here
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
