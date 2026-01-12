import Image from "next/image";

export const BookImage = ({ src, name }: { src: string; name: string }) => {
  return (
    <div className="p-6 bg-gray-300 rounded-2xl">
      <figure className="w-[380px] h-[480px] overflow-hidden">
        <Image
          alt={name}
          src={src}
          className="h-full w-full object-cover object-center"
          width={380}
          height={480}
        />
      </figure>
    </div>
  );
};
