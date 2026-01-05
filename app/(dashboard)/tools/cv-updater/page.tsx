'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, FileText } from 'lucide-react';

export default function CVUpdaterPage() {
  const [cvText, setCvText] = useState('');
  const [parsedCV, setParsedCV] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!cvText.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/extract-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText }),
      });

      if (!response.ok) throw new Error('Failed to parse CV');

      const data = await response.json();
      setParsedCV(data.parsedCV);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CV Parser & Updater</h1>
        <p className="text-muted-foreground mt-1">
          Extract structured data from CVs and update candidate profiles
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle>CV Text</CardTitle>
            <CardDescription>
              Paste the CV text to extract structured data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste CV text here..."
              className="min-h-[400px] font-mono text-sm"
            />
            <Button
              onClick={handleParse}
              disabled={!cvText.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Parse CV
            </Button>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle>Extracted Data</CardTitle>
            <CardDescription>
              Structured information from the CV
            </CardDescription>
          </CardHeader>
          <CardContent>
            {parsedCV ? (
              <div className="space-y-6 max-h-[500px] overflow-y-auto">
                {/* Candidate Info */}
                {parsedCV.candidate && (
                  <div>
                    <h4 className="font-medium mb-2">Candidate</h4>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                      <p className="font-medium">{parsedCV.candidate.fullName}</p>
                      <p className="text-sm text-muted-foreground">{parsedCV.candidate.email}</p>
                      <p className="text-sm text-muted-foreground">{parsedCV.candidate.location}</p>
                      {parsedCV.candidate.totalYearsExperience && (
                        <Badge variant="outline">
                          {parsedCV.candidate.totalYearsExperience} years exp
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {parsedCV.skills?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Skills ({parsedCV.skills.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {parsedCV.skills.map((skill: any, i: number) => (
                        <Badge
                          key={i}
                          variant={skill.proficiency === 'expert' ? 'default' : 'secondary'}
                        >
                          {skill.name}
                          {skill.yearsExperience && ` (${skill.yearsExperience}y)`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {parsedCV.experience?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Experience ({parsedCV.experience.length})</h4>
                    <div className="space-y-3">
                      {parsedCV.experience.map((exp: any, i: number) => (
                        <div key={i} className="p-3 border rounded-lg">
                          <p className="font-medium">{exp.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {exp.company} | {exp.domain}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {parsedCV.education?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Education</h4>
                    <div className="space-y-2">
                      {parsedCV.education.map((edu: any, i: number) => (
                        <div key={i} className="text-sm">
                          <p className="font-medium">{edu.degree} in {edu.field}</p>
                          <p className="text-muted-foreground">
                            {edu.institution} | {edu.year}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Red Flags */}
                {parsedCV.redFlags?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-600">Red Flags</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {parsedCV.redFlags.map((flag: string, i: number) => (
                        <li key={i}>{flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Completeness */}
                {parsedCV.completenessScore !== undefined && (
                  <div>
                    <h4 className="font-medium mb-2">CV Completeness</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${parsedCV.completenessScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{parsedCV.completenessScore}%</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Extracted data will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
