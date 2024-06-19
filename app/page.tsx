import { ModeToggle } from "@/components/sub-components/mode-toggle";

export default function Home() {
  return (
    <main>
      <div className="flex justify-between mx-5 my-5">
        <div className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Crept Sync
        </div>
        <ModeToggle />
        </div>
     
    </main>
  );
}
