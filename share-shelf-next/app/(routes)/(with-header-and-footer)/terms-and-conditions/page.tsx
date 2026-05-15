const sections = [
  {
    title: "Account Use",
    body: "You are responsible for the activity on your account and for keeping your login details private. Use accurate information when creating listings, requests, reviews, and discussion posts.",
  },
  {
    title: "Listings, Buying, and Trading",
    body: "Book listings, buy requests, and trade posts should describe the book condition, price, and exchange details honestly. Share Shelf helps readers connect, but users are responsible for agreeing on safe handover details.",
  },
  {
    title: "Payments",
    body: "Where payment features are available, follow the checkout flow shown in the app. Do not attempt to bypass platform payment or verification steps for paid exchanges.",
  },
  {
    title: "Community Content",
    body: "Posts, comments, reviews, and messages must be respectful, lawful, and relevant to books or book exchanges. We may remove reported content or restrict accounts that misuse the platform.",
  },
  {
    title: "Platform Changes",
    body: "Share Shelf may update features, moderation rules, or these terms as the service changes. Continued use of the platform means you accept the latest version shown here.",
  },
];

export default function TermsAndConditionsPage() {
  return (
    <main className="container mx-auto pt-36 pb-20">
      <div className="max-w-3xl">
        <p className="tag">Legal</p>
        <h1 className="heading-3 mt-3">Terms and Conditions</h1>
        <p className="mt-5 text-base leading-8 text-zinc-400">
          These terms explain the basic rules for using Share Shelf to discover, discuss, buy, sell, and trade books with other readers.
        </p>
      </div>

      <div className="mt-10 grid gap-5">
        {sections.map((section) => (
          <section
            key={section.title}
            className="border-l border-white/10 bg-white/[0.03] px-5 py-5"
          >
            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
