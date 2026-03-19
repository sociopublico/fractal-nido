import { useEffect } from 'react';
import Hero from './components/Hero';
import ArgentinaMapScroll from './components/ArgentinaMapScroll';
import NidoDimensionsScrolly from './components/NidoDimensionsScrolly';
import HorizontalScroll from './components/HorizontalScroll';
import PostHorizontalSection from './components/PostHorizontalSection';
import DonutSection from './components/DonutSection';
import LastSection from './components/LastSection';
import { useDataStore } from './store/useDataStore';

function App() {
  const fetchAll = useDataStore((s) => s.fetchAll);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="mi-app">
      <Hero />
      <ArgentinaMapScroll />
      <HorizontalScroll />
      <PostHorizontalSection />
      <NidoDimensionsScrolly />
      <DonutSection />
      <LastSection />
    </div>
  );
}

export default App;
