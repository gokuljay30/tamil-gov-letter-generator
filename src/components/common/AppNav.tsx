import Link from "next/link";

export default function AppNav() {
  return (
    <nav className="app-nav no-print" aria-label="முதன்மை வழிசெலுத்தல்">
      <div className="nav-brand">தமிழ் அரசு கடிதம்</div>
      <div className="nav-links">
        <Link href="/letters/new">புதிய கடிதம்</Link>
        <Link href="/letters">கடிதங்கள்</Link>
        <Link href="/templates">வார்ப்புருக்கள்</Link>
        <Link href="/settings">அமைப்புகள்</Link>
        <Link href="/help">உதவி</Link>
        <form action="/auth/logout" method="post">
          <button type="submit">வெளியேறு</button>
        </form>
      </div>
    </nav>
  );
}
