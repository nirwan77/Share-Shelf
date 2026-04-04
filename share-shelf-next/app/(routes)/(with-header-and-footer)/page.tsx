import {
  Choices,
  Connect,
  Hero,
  PopularBooks,
  FeaturedBooks,
} from "./components";

export default function Home() {
  return (
    <main>
      <Hero />

      <Connect />

      <Choices />

      <PopularBooks />
    </main>
  );
}
