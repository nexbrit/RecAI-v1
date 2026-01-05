'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, Copy, CheckCircle } from 'lucide-react';

export default function JDFormatterPage() {
  const [jd, setJd] = useState('');
  const [formattedJd, setFormattedJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFormat = async () => {
    if (!jd.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/format-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd }),
      });

      if (!response.ok) throw new Error('Failed to format JD');

      const data = await response.json();
      setFormattedJd(data.formattedJd);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedJd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">JD Formatter</h1>
        <p className="text-muted-foreground mt-1">
          Clean up and format messy job descriptions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle>Original JD</CardTitle>
            <CardDescription>
              Paste the raw, messy JD
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste messy job description here..."
              className="min-h-[400px] font-mono text-sm"
            />
            <Button
              onClick={handleFormat}
              disabled={!jd.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Format JD
            </Button>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Formatted JD</CardTitle>
              <CardDescription>
                Clean, structured version
              </CardDescription>
            </div>
            {formattedJd && (
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {formattedJd ? (
              <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg max-h-[500px] overflow-y-auto">
                {formattedJd}
              </pre>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Formatted JD will appear here
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
