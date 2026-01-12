import { Choices, Connect, Hero, PopularBooks } from "./components";

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
