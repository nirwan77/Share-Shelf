import BookCard from "@/components/manual/card";

const data = [
  {
    tag: "Buy",
    title: "Buy books from community",
    img: "/buy.jpg",
    link: "/explore"
  },
  {
    tag: "Exchange",
    title: "Exchange books with readers",
    img: "/exchange.jpg",
    link: "/explore"

  },
  {
    tag: "Discuss",
    title: "Join community discussions",
    img: "/discuss.jpg",
    link: "/discuss"
  },
];

export const Connect = () => {
  return (
    <div className="app-section container mx-auto">
      <div className="mb-12 text-center sm:mb-16">
        <span className="tag mb-3 font-bold">Connect</span>
        <h2 className="heading-2 mb-4">How book exchange works</h2>
        <p className="mx-auto max-w-xl text-zinc-400">
          Simple platform for book lovers to trade, discover, and connect
          through shared reading experiences.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
        {data.map((item, idx) => (
          <BookCard
            link={item.link}
            tag={item.tag}
            img={item.img}
            title={item.title}
            key={idx}
          />
        ))}
      </div>
    </div>
  );
};
