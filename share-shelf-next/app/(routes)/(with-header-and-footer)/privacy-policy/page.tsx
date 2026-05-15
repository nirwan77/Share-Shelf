const sections = [
  {
    title: "Information We Collect",
    body: "We collect the details you provide when you create an account, update your profile, post listings, request books, write reviews, join discussions, or send messages.",
  },
  {
    title: "How We Use Information",
    body: "We use your information to run the marketplace, show profiles and posts, process book exchanges, support payments, send notifications, and improve safety across the community.",
  },
  {
    title: "Public Content",
    body: "Listings, reviews, discussion posts, profile details, and other community content may be visible to other users depending on where you publish them.",
  },
  {
    title: "Security",
    body: "We use authentication and access controls to protect account data. You should keep your login details private and report suspicious activity promptly.",
  },
  {
    title: "Your Choices",
    body: "You can update your profile information in the app. You may also stop using Share Shelf if you no longer want to participate in the community.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto pt-36 pb-20">
      <div className="max-w-3xl">
        <p className="tag">Legal</p>
        <h1 className="heading-3 mt-3">Privacy Policy</h1>
        <p className="mt-5 text-base leading-8 text-zinc-400">
          This policy explains how Share Shelf handles information used to support accounts, listings, purchases, trades, reviews, and discussions.
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
