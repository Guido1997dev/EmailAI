import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="grid gap-8 sm:gap-12">
        <section className="text-center grid gap-6">
          <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight">
            MailSprint AI
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Genereer e-mails in jouw persoonlijke tone of voice. Sneller, consistenter, en direct vanuit je Chrome extensie.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/signup" className="rounded-md px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black border border-black/10 dark:border-white/20">
              Start gratis
            </Link>
            <a href="#how-it-works" className="rounded-md px-5 py-2.5 border border-black/10 dark:border-white/20">
              Hoe het werkt
            </a>
          </div>
        </section>

        <section id="how-it-works" className="grid gap-4">
          <h2 className="text-2xl font-medium">Hoe het werkt</h2>
          <ol className="grid gap-3 list-decimal pl-4 text-neutral-700 dark:text-neutral-300">
            <li>Maak een account aan en kies je tone of voice in het dashboard.</li>
            <li>Installeer de Chrome extensie (binnenkort) en log in.</li>
            <li>Genereer een e-mail met één klik—MailSprint past jouw stijl toe.</li>
          </ol>
        </section>

        <section className="grid gap-4">
          <h2 className="text-2xl font-medium">Prijzen</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-lg border border-black/10 dark:border-white/20">
              <h3 className="text-xl font-medium">Free</h3>
              <p className="text-neutral-600 dark:text-neutral-300">Beperkte credits per maand</p>
              <Link href="/signup" className="mt-4 inline-block rounded-md px-4 py-2 bg-black text-white dark:bg-white dark:text-black border border-black/10 dark:border-white/20">Start</Link>
            </div>
            <div className="p-6 rounded-lg border border-black/10 dark:border-white/20">
              <h3 className="text-xl font-medium">Pro</h3>
              <p className="text-neutral-600 dark:text-neutral-300">Onbeperkte generaties, prioriteit</p>
              <Link href="/dashboard/billing" className="mt-4 inline-block rounded-md px-4 py-2 border border-black/10 dark:border-white/20">Upgrade</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


