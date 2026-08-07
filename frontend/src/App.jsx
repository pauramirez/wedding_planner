import { useEffect, useState, useCallback } from "react";
import { state } from "./lib/api.js";
import RsvpPage from "./pages/RsvpPage.jsx";
import RsvpLookup from "./pages/RsvpLookup.jsx";
import Hero from "./components/Hero.jsx";
import Tabs from "./components/Tabs.jsx";
import Overview from "./panels/Overview.jsx";
import TasksPanel from "./panels/TasksPanel.jsx";
import GuestsPanel from "./panels/GuestsPanel.jsx";
import VendorsPanel from "./panels/VendorsPanel.jsx";
import GiftsPanel from "./panels/GiftsPanel.jsx";
import PalettePanel from "./panels/PalettePanel.jsx";
import TimelinePanel from "./panels/TimelinePanel.jsx";
import BudgetPanel from "./panels/BudgetPanel.jsx";
import Toolbar from "./components/Toolbar.jsx";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "vancouver", label: "🇨🇦 Vancouver" },
  { id: "colombia", label: "🇨🇴 Colombia" },
  { id: "shared", label: "Both Weddings" },
  { id: "guests", label: "Guest List" },
  { id: "vendors", label: "Vendors" },
  { id: "gifts", label: "Gifts" },
  { id: "colors", label: "Color Palette" },
  { id: "timeline", label: "Day-of Timeline" },
  { id: "budget", label: "Budget" }
];

const EMPTY = {
  tasks: [], guests: [], vendors: [], gifts: [], palette: [],
  timelineVan: [], timelineCol: [],
  weddingDates: { van: "", col: "" }
};

// Very light routing — the planner is state-based, but /rsvp/<token> is a
// separate public page for guests. It's rendered by a separate component so
// the planner's hooks don't run when a guest hits their RSVP link.
const RSVP_MATCH = /^\/rsvp\/([a-f0-9]{32})\/?$/;

export default function App() {
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    const rsvpMatch = path.match(RSVP_MATCH);
    if (rsvpMatch) return <RsvpPage token={rsvpMatch[1]} />;
    if (path === "/rsvp" || path === "/rsvp/") return <RsvpLookup />;
  }
  return <Planner />;
}

function Planner() {
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState(EMPTY);

  const refresh = useCallback(async () => {
    const snap = await state.snapshot();
    setData({
      tasks: snap.tasks || [],
      guests: snap.guests || [],
      vendors: snap.vendors || [],
      gifts: snap.gifts || [],
      palette: snap.palette || [],
      timelineVan: snap.timelineVan || [],
      timelineCol: snap.timelineCol || [],
      weddingDates: snap.weddingDates || { van: "", col: "" }
    });
  }, []);

  useEffect(() => {
    refresh().catch((e) => console.error("snapshot failed", e));
  }, [refresh]);

  const panels = {
    overview: <Overview data={data} onRefresh={refresh} />,
    vancouver: <TasksPanel cat="vancouver" title="Vancouver Civil Wedding — Tasks" dotClass="van" tasks={data.tasks} onRefresh={refresh} />,
    colombia: <TasksPanel cat="colombia" title="Colombia Catholic Wedding — Tasks" dotClass="col" tasks={data.tasks} onRefresh={refresh} />,
    shared: <TasksPanel cat="shared" title="Both Weddings — Tasks" dotClass="shared" tasks={data.tasks} onRefresh={refresh} />,
    guests: <GuestsPanel guests={data.guests} onRefresh={refresh} />,
    vendors: <VendorsPanel vendors={data.vendors} onRefresh={refresh} />,
    gifts: <GiftsPanel gifts={data.gifts} onRefresh={refresh} />,
    colors: <PalettePanel palette={data.palette} onRefresh={refresh} />,
    timeline: <TimelinePanel timelineVan={data.timelineVan} timelineCol={data.timelineCol} onRefresh={refresh} />,
    budget: <BudgetPanel data={data} />
  };

  return (
    <>
      <Hero data={data} onRefresh={refresh} />
      <div className="wrap">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        <main>
          {panels[tab]}
          <Toolbar data={data} onRefresh={refresh} />
        </main>
        <footer>Made with love — for the two of you.</footer>
      </div>
    </>
  );
}
