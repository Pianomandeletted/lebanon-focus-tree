import { TopNav } from "@/components/nav/TopNav";
import { MusicPlayer } from "@/components/music/MusicPlayer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="national-gradient min-h-screen">
      <TopNav />
      <main>{children}</main>
      <MusicPlayer />
    </div>
  );
}
