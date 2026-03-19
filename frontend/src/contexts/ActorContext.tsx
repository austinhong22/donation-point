import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { listDemoActors, setApiActorId } from '../api/client';
import type { DemoActor } from '../api/types';

interface ActorContextValue {
  actors: DemoActor[];
  currentActor: DemoActor | null;
  isLoading: boolean;
  errorMessage: string | null;
  selectActor: (actorId: number) => void;
  refreshActors: () => Promise<void>;
}

const STORAGE_KEY = 'fair-donation-point-poc.actor-id';

const ActorContext = createContext<ActorContextValue | undefined>(undefined);

export function ActorProvider({ children }: { children: ReactNode }) {
  const [actors, setActors] = useState<DemoActor[]>([]);
  const [selectedActorId, setSelectedActorId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadActors() {
    setIsLoading(true);

    try {
      const nextActors = await listDemoActors();
      const storedActorId = Number(window.localStorage.getItem(STORAGE_KEY));
      const currentSelectedActorId = selectedActorId ?? storedActorId;
      const fallbackActorId = nextActors[0]?.id ?? null;
      const resolvedActorId = nextActors.some((actor) => actor.id === currentSelectedActorId)
        ? currentSelectedActorId
        : fallbackActorId;

      setActors(nextActors);
      setSelectedActorId(resolvedActorId);
      setErrorMessage(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : '데모 역할 정보를 불러오지 못했습니다.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadActors();
  }, []);

  const currentActor = actors.find((actor) => actor.id === selectedActorId) ?? null;

  useEffect(() => {
    setApiActorId(currentActor?.id ?? null);

    if (currentActor?.id) {
      window.localStorage.setItem(STORAGE_KEY, String(currentActor.id));
    }
  }, [currentActor]);

  return (
    <ActorContext.Provider
      value={{
        actors,
        currentActor,
        isLoading,
        errorMessage,
        selectActor: setSelectedActorId,
        refreshActors: loadActors,
      }}
    >
      {children}
    </ActorContext.Provider>
  );
}

export function useActor() {
  const context = useContext(ActorContext);

  if (!context) {
    throw new Error('useActor must be used within ActorProvider');
  }

  return context;
}
