import { Outlet, Route, Routes } from "react-router-dom";
import { LanguageModal } from "@/i18n/language-modal";
import { TopBar } from "@/shared/components/top-bar";
import { BuddyPage } from "@/pages/buddy";
import { LandingPage } from "@/pages/landing";
import { PairPage } from "@/pages/pair";

function Layout() {
  return (
    <>
      <LanguageModal />
      <TopBar />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/buddy" element={<BuddyPage />} />
        <Route path="/buddy/:username" element={<BuddyPage />} />
        <Route path="/pair/:from/:to" element={<PairPage />} />
      </Route>
    </Routes>
  );
}
