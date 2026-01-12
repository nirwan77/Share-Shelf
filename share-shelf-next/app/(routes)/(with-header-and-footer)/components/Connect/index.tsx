import BookCard from "@/components/manual/card";

const data = [
  {
    tag: "Buy",
    title: "Buy books from community",
    img: "/buy.jpg",
  },
  {
    tag: "Exchange",
    title: "Exchange books with readers",
    img: "/exchange.jpg",
  },
  {
    tag: "Discuss",
    title: "Join community discussions",
    img: "/discuss.jpg",
  },
];

export const Connect = () => {
  return (
    <div className="py-30 container mx-auto">
      <div className="text-center mb-20">
        <span className="tag mb-3 font-bold">Connect</span>
        <h2 className="heading-2 mb-4">How book exchange works</h2>
        <p className="max-w-md mx-auto">
          Simple platform for book lovers to trade, discover, and connect
          through shared reading experiences.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-8">
        {data.map((item, idx) => (
          <BookCard
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
