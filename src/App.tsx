import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { STORY_TEMPLATES, TEMPLATE_CATEGORIES } from '@/constants/templates';
import { ExploreTemplatesSection } from '@/features/dashboard/ExploreTemplatesSection';
import { HeroSection } from '@/features/dashboard/HeroSection';
import { RecentProjectsSection } from '@/features/dashboard/RecentProjectsSection';
import { WorkspaceLaunchersSection } from '@/features/dashboard/WorkspaceLaunchersSection';

const StoryCreatorPage = lazy(() =>
  import('@/features/story-creator/StoryCreatorPage').then((m) => ({
    default: m.StoryCreatorPage,
  })),
);
import type {
  AppView,
  NavItemId,
  StoredProject,
  StoryTemplate,
  WorkspaceMode,
} from '@/types/studio';
import {
  createNewProjectId,
  deleteProject,
  duplicateProject,
  listProjects,
  loadProject,
} from '@/utils/projectStorage';

const ACTIVE_PROJECT_KEY = 'frame:active-project-id';

export function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [activeNav, setActiveNav] = useState<NavItemId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [editingProject, setEditingProject] = useState<StoredProject | null>(
    null,
  );
  const [editingTemplate, setEditingTemplate] = useState<StoryTemplate | null>(
    null,
  );
  const [activeWorkspaceMode, setActiveWorkspaceMode] =
    useState<WorkspaceMode>('story');

  const refreshProjects = useCallback(async () => {
    const saved = await listProjects();
    setProjects(saved);
  }, []);

  // Restore project if user reloads while inside editor, and load recent projects
  useEffect(() => {
    void (async () => {
      await refreshProjects();
      const lastId = sessionStorage.getItem(ACTIVE_PROJECT_KEY);
      if (lastId) {
        const restored = await loadProject(lastId);
        if (restored) {
          setActiveProjectId(restored.id);
          setEditingProject(restored);
          setEditingTemplate(null);
          setCurrentView('editor');
        } else {
          sessionStorage.removeItem(ACTIVE_PROJECT_KEY);
        }
      }
    })();
  }, [refreshProjects]);

  const handleCreateStory = (mode: WorkspaceMode = 'story') => {
    const newId = createNewProjectId();
    setActiveProjectId(newId);
    setEditingProject(null);
    setEditingTemplate(null);
    setActiveWorkspaceMode(mode);
    sessionStorage.setItem(ACTIVE_PROJECT_KEY, newId);
    setCurrentView('editor');
  };

  const handleSelectTemplate = (template: StoryTemplate) => {
    const newId = createNewProjectId();
    setActiveProjectId(newId);
    setEditingProject(null);
    setEditingTemplate(template);
    sessionStorage.setItem(ACTIVE_PROJECT_KEY, newId);
    setCurrentView('editor');
  };

  const handleOpenProject = (project: StoredProject) => {
    setActiveProjectId(project.id);
    setEditingProject(project);
    setEditingTemplate(null);
    sessionStorage.setItem(ACTIVE_PROJECT_KEY, project.id);
    setCurrentView('editor');
  };

  const handleDuplicateProject = async (id: string) => {
    await duplicateProject(id);
    await refreshProjects();
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    await refreshProjects();
  };

  const handleBackToDashboard = () => {
    sessionStorage.removeItem(ACTIVE_PROJECT_KEY);
    setCurrentView('dashboard');
    void refreshProjects();
  };

  const handleExploreTemplates = () => {
    setActiveNav('dashboard');
    document
      .getElementById('explore-templates')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  if (currentView === 'editor' && activeProjectId) {
    return (
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-[#09090b] text-xs text-neutral-400">
            Memuat Story Studio...
          </div>
        }
      >
        <StoryCreatorPage
          key={activeProjectId}
          projectId={activeProjectId}
          initialProject={editingProject}
          initialTemplate={editingTemplate}
          initialWorkspaceMode={activeWorkspaceMode}
          onBackToDashboard={handleBackToDashboard}
        />
      </Suspense>
    );
  }

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
          {activeNav === 'dashboard' && (
            <>
              <HeroSection
                onCreateStory={() => handleCreateStory('story')}
                onExploreTemplates={handleExploreTemplates}
              />
              <WorkspaceLaunchersSection
                onLaunchWorkspace={(mode) => handleCreateStory(mode)}
              />
              <RecentProjectsSection
                projects={projects}
                onCreateStory={handleCreateStory}
                onOpenProject={handleOpenProject}
                onDuplicateProject={(id) => void handleDuplicateProject(id)}
                onDeleteProject={(id) => void handleDeleteProject(id)}
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
              projects={projects}
              onCreateStory={handleCreateStory}
              onOpenProject={handleOpenProject}
              onDuplicateProject={(id) => void handleDuplicateProject(id)}
              onDeleteProject={(id) => void handleDeleteProject(id)}
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
                Instagram Story 1080 × 1920 px (9:16). Proyek disimpan secara
                lokal menggunakan IndexedDB.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
