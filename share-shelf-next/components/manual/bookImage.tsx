import Image from "next/image";

export const BookImage = ({ src, name }: { src: string; name: string }) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#18181b] via-[#0f0f12] to-black p-5 shadow-[0_18px_55px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-[#ff7a00]/45 hover:shadow-[0_22px_70px_rgba(255,122,0,0.14)]">
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#ff7a00]/70 to-transparent" />
      <figure className="h-[360px] w-[260px] overflow-hidden rounded-xl shadow-[14px_20px_35px_rgba(0,0,0,0.5)] sm:h-[420px] sm:w-[320px] lg:h-[480px] lg:w-[380px]">
        <Image
          alt={name}
          src={src}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          width={380}
          height={480}
        />
      </figure>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-white/[0.03]" />
    </div>
  );
};
