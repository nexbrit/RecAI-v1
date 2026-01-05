import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Redirect to skill mapper tool
export default function SkillsSettingsPage() {
  redirect('/tools/skill-mapper');
}
