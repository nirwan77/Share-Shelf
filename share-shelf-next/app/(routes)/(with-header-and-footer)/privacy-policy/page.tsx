const sections = [
  {
    title: "Information We Collect",
    body: "We collect the details needed to run Share Shelf, including your name, email address, phone number, profile information, listings, book requests, purchase locations, trade messages, reviews, discussion posts, reports, and payment references.",
  },
  {
    title: "Why We Use Information",
    body: "We use this information to create accounts, verify users, display listings, connect buyers and sellers, support trades and purchases, send notifications, investigate reports, prevent misuse, and keep records needed for platform accountability.",
  },
  {
    title: "Legal Basis",
    body: "We process account, listing, purchase, and message information because it is needed to provide the service users request. We also process safety, moderation, and payment records where there is a legitimate interest in preventing fraud, abuse, and disputes.",
  },
  {
    title: "Public Content",
    body: "Listings, reviews, discussion posts, profile details, seller locations, and other community content may be visible to other users depending on where you publish them. Avoid posting private addresses or sensitive information in public areas.",
  },
  {
    title: "Payments and Contact Details",
    body: "Payment confirmation and purchase records are used to track orders, commission, payouts, and buyer receipt confirmation. Seller contact details may be shown to the buyer only where needed to complete an exchange.",
  },
  {
    title: "Security",
    body: "Passwords are protected using hashing, access to private routes requires authentication, and payment signing secrets are handled by the backend. Users should keep login details private and report suspicious activity promptly.",
  },
  {
    title: "Retention",
    body: "We keep account, listing, purchase, payout, and moderation records only for as long as needed to operate the service, resolve disputes, meet academic audit needs, and support legal or safety obligations.",
  },
  {
    title: "Your Choices",
    body: "You can update your profile information in the app. You may ask for access, correction, restriction, or deletion of personal information where those rights apply, and you may stop using Share Shelf if you no longer want to participate.",
  },
  {
    title: "Wellbeing and Safety",
    body: "Share Shelf includes reports, bans, appeals, and buyer confirmation features to reduce harmful behaviour. Users should choose safe public meeting points and avoid sharing unnecessary personal details.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="container mx-auto pt-36 pb-20">
      <div className="max-w-3xl">
        <p className="tag">Legal</p>
        <h1 className="heading-3 mt-3">Privacy Policy</h1>
        <p className="mt-5 text-base leading-8 text-zinc-400">
          This policy explains how Share Shelf handles information used to support accounts, listings, purchases, trades, reviews, discussions, payments, and moderation.
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
