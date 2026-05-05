import { supabase } from '../lib/supabase';

export interface PullQuote {
  text: string;
  attr: string;
}

export interface CreditItem {
  title: string;
  company?: string;
  year?: string;
}

export interface CreditGroup {
  role: string;
  items: CreditItem[];
}

export interface RecognitionItem {
  title: string;
  body: string;
  year: string;
}

export interface EducationItem {
  school: string;
  course: string;
  year: string;
}

export interface AboutContent {
  bioParagraphs: string[];
  pullQuotes: PullQuote[];
  credits: CreditGroup[];
  recognition: RecognitionItem[];
  education: EducationItem[];
}

export async function getAboutContent(): Promise<AboutContent> {
  const { data, error } = await supabase
    .from('about_content')
    .select('bio_paragraphs, pull_quotes, credits, recognition, education')
    .eq('id', 1)
    .single();

  if (error || !data) {
    return { bioParagraphs: [], pullQuotes: [], credits: [], recognition: [], education: [] };
  }

  return {
    bioParagraphs: (data.bio_paragraphs as string[])         ?? [],
    pullQuotes:    (data.pull_quotes    as PullQuote[])      ?? [],
    credits:       (data.credits        as CreditGroup[])    ?? [],
    recognition:   (data.recognition   as RecognitionItem[]) ?? [],
    education:     (data.education      as EducationItem[])  ?? [],
  };
}

export async function adminSaveAboutContent(content: AboutContent): Promise<void> {
  const { error } = await supabase
    .from('about_content')
    .upsert({
      id:             1,
      bio_paragraphs: content.bioParagraphs,
      pull_quotes:    content.pullQuotes,
      credits:        content.credits,
      recognition:    content.recognition,
      education:      content.education,
    });
  if (error) throw error;
}
