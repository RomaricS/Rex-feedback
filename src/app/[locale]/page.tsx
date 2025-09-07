import { redirect } from 'next/navigation';

export default async function LocalePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params;
  // Redirect to the dashboard with the current locale
  redirect(`/${locale}/dashboard`);
}