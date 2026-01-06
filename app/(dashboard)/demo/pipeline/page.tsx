'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { StageTabs, defaultStageTabs, PipelineStage } from '@/components/pipeline';
import { CandidateTable } from '@/components/pipeline/CandidateTable';
import { CandidateData } from '@/components/pipeline/CandidateRow';
import { useNavigationShortcuts } from '@/hooks/useKeyboardShortcuts';

// Mock data for demonstration
const mockCandidates: CandidateData[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    title: 'Senior Software Engineer',
    score: 9.2,
    matchPercentage: 94,
    skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'GraphQL'],
    rate: { amount: 150, currency: '$', period: 'hour' },
    stage: 'qualified',
    source: 'LinkedIn',
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    email: 'm.rodriguez@email.com',
    title: 'Full Stack Developer',
    score: 8.7,
    matchPercentage: 88,
    skills: ['Python', 'Django', 'React', 'PostgreSQL'],
    rate: { amount: 130, currency: '$', period: 'hour' },
    stage: 'interview',
    source: 'Referral',
  },
  {
    id: '3',
    name: 'Emily Watson',
    email: 'emily.w@email.com',
    title: 'Frontend Developer',
    score: 8.1,
    matchPercentage: 82,
    skills: ['Vue.js', 'JavaScript', 'CSS', 'Figma'],
    rate: { amount: 110, currency: '$', period: 'hour' },
    stage: 'screening',
    source: 'Indeed',
  },
  {
    id: '4',
    name: 'James Park',
    email: 'james.park@email.com',
    title: 'Backend Engineer',
    score: 7.8,
    matchPercentage: 76,
    skills: ['Go', 'Kubernetes', 'Docker', 'gRPC'],
    rate: { amount: 140, currency: '$', period: 'hour' },
    stage: 'new',
    source: 'LinkedIn',
  },
  {
    id: '5',
    name: 'Anna Kowalski',
    email: 'anna.k@email.com',
    title: 'DevOps Engineer',
    score: 8.9,
    matchPercentage: 91,
    skills: ['AWS', 'Terraform', 'CI/CD', 'Python', 'Ansible'],
    rate: { amount: 145, currency: '$', period: 'hour' },
    stage: 'submitted',
    source: 'Hired.com',
  },
  {
    id: '6',
    name: 'David Kim',
    email: 'david.kim@email.com',
    title: 'Tech Lead',
    score: 9.5,
    matchPercentage: 97,
    skills: ['Architecture', 'Java', 'Spring Boot', 'Microservices', 'Kafka'],
    rate: { amount: 180, currency: '$', period: 'hour' },
    stage: 'offer',
    source: 'Direct',
  },
  {
    id: '7',
    name: 'Lisa Thompson',
    email: 'lisa.t@email.com',
    title: 'Software Engineer',
    score: 6.2,
    matchPercentage: 58,
    skills: ['Java', 'Spring', 'MySQL'],
    rate: { amount: 95, currency: '$', period: 'hour' },
    stage: 'rejected',
    source: 'LinkedIn',
  },
  {
    id: '8',
    name: 'Robert Martinez',
    email: 'r.martinez@email.com',
    title: 'Cloud Architect',
    score: 8.4,
    matchPercentage: 85,
    skills: ['Azure', 'GCP', 'Terraform', 'Security'],
    rate: { amount: 160, currency: '$', period: 'hour' },
    stage: 'qualified',
    source: 'Glassdoor',
  },
  {
    id: '9',
    name: 'Jennifer Lee',
    email: 'jen.lee@email.com',
    title: 'Data Engineer',
    score: 7.9,
    matchPercentage: 79,
    skills: ['Spark', 'Python', 'Airflow', 'Snowflake'],
    rate: { amount: 135, currency: '$', period: 'hour' },
    stage: 'screening',
    source: 'AngelList',
  },
  {
    id: '10',
    name: 'Chris Anderson',
    email: 'c.anderson@email.com',
    title: 'Mobile Developer',
    score: 7.5,
    matchPercentage: 72,
    skills: ['React Native', 'iOS', 'Android', 'Flutter'],
    rate: { amount: 120, currency: '$', period: 'hour' },
    stage: 'new',
    source: 'Stack Overflow',
  },
];

export default function DemoPipelinePage() {
  const router = useRouter();
  const [activeStage, setActiveStage] = useState<PipelineStage>('all');
  const [candidates, setCandidates] = useState<CandidateData[]>(mockCandidates);

  // Enable navigation shortcuts
  useNavigationShortcuts();

  // Filter candidates by stage
  const filteredCandidates = activeStage === 'all'
    ? candidates
    : candidates.filter((c) => c.stage === activeStage);

  // Calculate tab counts
  const tabsWithCounts = defaultStageTabs.map((tab) => ({
    ...tab,
    count: tab.id === 'all'
      ? candidates.length
      : candidates.filter((c) => c.stage === tab.id).length,
  }));

  const handleCandidateView = useCallback((id: string) => {
    router.push(`/candidates/${id}`);
  }, [router]);

  const handleCandidateEvaluate = useCallback((id: string) => {
    console.log('Evaluate candidate:', id);
    // Would trigger evaluation flow
  }, []);

  const handleCandidateMoveStage = useCallback((id: string, stage: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, stage: stage as CandidateData['stage'] } : c
      )
    );
  }, []);

  const handleBulkAction = useCallback((action: string, ids: string[]) => {
    console.log('Bulk action:', action, 'on candidates:', ids);

    if (action.startsWith('move:')) {
      const stage = action.replace('move:', '') as CandidateData['stage'];
      setCandidates((prev) =>
        prev.map((c) =>
          ids.includes(c.id) ? { ...c, stage } : c
        )
      );
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              Terminal Pipeline Demo
            </h1>
            <p className="text-sm text-text-muted">
              Senior Full Stack Engineer | Demo View
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary font-mono">
              {filteredCandidates.length} candidates
            </span>
          </div>
        </div>
      </div>

      {/* Stage Tabs */}
      <StageTabs
        tabs={tabsWithCounts}
        activeTab={activeStage}
        onTabChange={setActiveStage}
        className="px-4"
      />

      {/* Candidate Table */}
      <div className="flex-1 overflow-hidden">
        <CandidateTable
          candidates={filteredCandidates}
          onCandidateView={handleCandidateView}
          onCandidateEvaluate={handleCandidateEvaluate}
          onCandidateMoveStage={handleCandidateMoveStage}
          onBulkAction={handleBulkAction}
        />
      </div>
    </div>
  );
}
