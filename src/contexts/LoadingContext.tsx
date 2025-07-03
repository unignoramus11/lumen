/**
 * @file This file defines the LoadingContext, which provides a way to manage loading states
 * across different components in the application. It allows components to register their
 * loading status, and the context can then determine if all registered components have finished loading.
 */

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from "react";

/**
 * Defines the shape of the LoadingContext's value.
 * @property {Record<string, boolean>} loadingStates - An object where keys are component IDs and values are their loading status (true if loading, false if loaded).
 * @property {(componentId: string, isLoading: boolean) => void} setComponentLoading - A function to update the loading status of a specific component.
 * @property {boolean} allLoaded - A boolean indicating whether all registered components have finished loading.
 */
interface LoadingContextType {
  loadingStates: Record<string, boolean>;
  setComponentLoading: (componentId: string, isLoading: boolean) => void;
  allLoaded: boolean;
}

/**
 * The React Context for managing loading states.
 * It is initialized with `undefined` and is expected to be provided by `LoadingProvider`.
 */
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

/**
 * Custom hook to consume the LoadingContext.
 * Throws an error if used outside of a `LoadingProvider`.
 * @returns {LoadingContextType} The current value of the LoadingContext.
 * @throws {Error} If `useLoading` is not used within a `LoadingProvider`.
 */
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

/**
 * Props for the LoadingProvider component.
 * @property {ReactNode} children - The child components that will have access to the loading context.
 */
interface LoadingProviderProps {
  children: ReactNode;
}

/**
 * The LoadingProvider component. It manages the loading states of various components
 * and provides these states, along with a function to update them, to its children via context.
 * @param {LoadingProviderProps} { children } - The props for the LoadingProvider component.
 * @returns {JSX.Element} A React Context Provider that wraps the children.
 */
export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
}) => {
  /**
   * State to store the loading status of individual components.
   * @type {Record<string, boolean>}
   */
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  /**
   * Memoized callback function to update the loading status of a specific component.
   * It prevents unnecessary re-renders by only updating the state if the loading status actually changes.
   * @param {string} componentId - A unique identifier for the component whose loading status is being updated.
   * @param {boolean} isLoading - The new loading status (true if loading, false if loaded).
   */
  const setComponentLoading = useCallback(
    (componentId: string, isLoading: boolean) => {
      setLoadingStates((prev) => {
        // Only update if the value actually changed to prevent unnecessary re-renders
        if (prev[componentId] === isLoading) {
          return prev;
        }
        return {
          ...prev,
          [componentId]: isLoading,
        };
      });
    },
    [] // Empty dependency array ensures this function is stable across renders
  );

  /**
   * Memoized boolean indicating whether all registered components have finished loading.
   * It re-calculates only when `loadingStates` changes.
   * @type {boolean}
   */
  const allLoaded = useMemo(() => {
    const states = Object.values(loadingStates);
    // All components are considered loaded if there are states and all of them are false (not loading).
    return states.length > 0 && states.every((state) => !state);
  }, [loadingStates]); // Dependency: re-calculate when loadingStates changes

  /**
   * Memoized value for the context provider.
   * Ensures that the context value is stable and prevents unnecessary re-renders of consumers.
   * @type {LoadingContextType}
   */
  const contextValue = useMemo(
    () => ({
      loadingStates,
      setComponentLoading,
      allLoaded,
    }),
    [loadingStates, setComponentLoading, allLoaded] // Dependencies for memoization
  );

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};
