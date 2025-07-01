import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from "react";

interface LoadingContextType {
  loadingStates: Record<string, boolean>;
  setComponentLoading: (componentId: string, isLoading: boolean) => void;
  allLoaded: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
}) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const setComponentLoading = useCallback(
    (componentId: string, isLoading: boolean) => {
      setLoadingStates((prev) => {
        // Only update if the value actually changed
        if (prev[componentId] === isLoading) {
          return prev;
        }
        return {
          ...prev,
          [componentId]: isLoading,
        };
      });
    },
    []
  );

  // Use useMemo to prevent recalculation on every render
  const allLoaded = useMemo(() => {
    const states = Object.values(loadingStates);
    return states.length > 0 && states.every((state) => !state);
  }, [loadingStates]);

  const contextValue = useMemo(
    () => ({
      loadingStates,
      setComponentLoading,
      allLoaded,
    }),
    [loadingStates, setComponentLoading, allLoaded]
  );

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};
