'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Copy, CheckCircle } from 'lucide-react';

export default function JDDecoderPage() {
  const [jd, setJd] = useState('');
  const [decodedJd, setDecodedJd] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDecode = async () => {
    if (!jd.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/decode-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd }),
      });

      if (!response.ok) throw new Error('Failed to decode JD');

      const data = await response.json();
      setDecodedJd(data.decodedJd);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(decodedJd, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">JD Decoder</h1>
        <p className="text-muted-foreground mt-1">
          Extract structured requirements from any job description
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>
              Paste the raw JD to extract requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste job description here..."
              className="min-h-[400px] font-mono text-sm"
            />
            <Button
              onClick={handleDecode}
              disabled={!jd.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Decode JD
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
              <CardTitle>Extracted Requirements</CardTitle>
              <CardDescription>
                Structured data from the JD
              </CardDescription>
            </div>
            {decodedJd && (
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? 'Copied!' : 'Copy JSON'}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {decodedJd ? (
              <div className="space-y-6 max-h-[500px] overflow-y-auto">
                {/* Summary */}
                {decodedJd.summary && (
                  <div>
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">{decodedJd.summary}</p>
                  </div>
                )}

                {/* Must Have */}
                {decodedJd.must_have_skills?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">Must Have Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {decodedJd.must_have_skills.map((skill: any, i: number) => (
                        <Badge key={i} className="bg-green-100 text-green-800">
                          {skill.name}
                          {skill.years_required && ` (${skill.years_required}+ yrs)`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nice to Have */}
                {decodedJd.nice_to_have_skills?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-blue-600">Nice to Have</h4>
                    <div className="flex flex-wrap gap-2">
                      {decodedJd.nice_to_have_skills.map((skill: any, i: number) => (
                        <Badge key={i} variant="secondary">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {decodedJd.experience_required && (
                  <div>
                    <h4 className="font-medium mb-2">Experience Required</h4>
                    <p className="text-sm text-muted-foreground">{decodedJd.experience_required}</p>
                  </div>
                )}

                {/* Domain */}
                {decodedJd.domain_knowledge?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Domain Knowledge</h4>
                    <div className="flex flex-wrap gap-2">
                      {decodedJd.domain_knowledge.map((domain: string, i: number) => (
                        <Badge key={i} variant="outline">{domain}</Badge>
                      ))}
                    </div>
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

                {/* Work Arrangement */}
                {decodedJd.work_arrangement && (
                  <div>
                    <h4 className="font-medium mb-2">Work Arrangement</h4>
                    <p className="text-sm text-muted-foreground">{decodedJd.work_arrangement}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Decoded requirements will appear here
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
