import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { RECENT_PROJECTS } from '@/constants/projects';
import { STORY_TEMPLATES, TEMPLATE_CATEGORIES } from '@/constants/templates';
import { ExploreTemplatesSection } from '@/features/dashboard/ExploreTemplatesSection';
import { HeroSection } from '@/features/dashboard/HeroSection';
import { RecentProjectsSection } from '@/features/dashboard/RecentProjectsSection';
import type { NavItemId, StoryTemplate } from '@/types/studio';

export function App() {
  const [activeNav, setActiveNav] = useState<NavItemId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEmptyDemo, setShowEmptyDemo] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const triggerNotice = (message: string) => {
    setNotice(message);
  };

  const handleCreateStory = () => {
    triggerNotice(
      'Editor Story (1080 × 1920 px) akan tersedia pada tahap pengembangan berikutnya.',
    );
  };

  const handleSelectTemplate = (template: StoryTemplate) => {
    triggerNotice(
      `Template "${template.title}" (${template.category}) dipilih. Editor Story akan segera hadir.`,
    );
  };

  const handleExploreTemplates = () => {
    setActiveNav('dashboard');
    document
      .getElementById('explore-templates')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen bg-[#09090b] text-neutral-100 antialiased">
      <Sidebar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onCreateStory={handleCreateStory}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {notice && (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/[0.05] px-4 py-3 text-xs text-neutral-200 sm:text-sm">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice(null)}
                className="shrink-0 text-xs font-medium text-neutral-400 hover:text-white"
              >
                Tutup
              </button>
            </div>
          )}

          {activeNav === 'dashboard' && (
            <>
              <HeroSection
                onCreateStory={handleCreateStory}
                onExploreTemplates={handleExploreTemplates}
              />
              <RecentProjectsSection
                projects={RECENT_PROJECTS}
                showEmptyDemo={showEmptyDemo}
                onToggleEmptyDemo={() => setShowEmptyDemo((prev) => !prev)}
                onCreateStory={handleCreateStory}
              />
              <ExploreTemplatesSection
                templates={STORY_TEMPLATES}
                categories={TEMPLATE_CATEGORIES}
                onSelectTemplate={handleSelectTemplate}
              />
            </>
          )}

          {activeNav === 'projects' && (
            <RecentProjectsSection
              projects={RECENT_PROJECTS}
              showEmptyDemo={showEmptyDemo}
              onToggleEmptyDemo={() => setShowEmptyDemo((prev) => !prev)}
              onCreateStory={handleCreateStory}
            />
          )}

          {activeNav === 'templates' && (
            <ExploreTemplatesSection
              templates={STORY_TEMPLATES}
              categories={TEMPLATE_CATEGORIES}
              onSelectTemplate={handleSelectTemplate}
            />
          )}

          {activeNav === 'settings' && (
            <section className="rounded-2xl border border-white/10 bg-[#111114] p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Pengaturan studio FRAME. Format kanvas default terkunci pada
                Instagram Story 1080 × 1920 px (9:16).
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
