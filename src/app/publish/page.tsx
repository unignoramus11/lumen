"use client";

/**
 * @file This file defines the PublishPage component, which serves as an administrative interface
 * for publishing and editing daily content editions for the Lumen Sigma application.
 * It includes authentication, image compression, and form handling for headlines, photos, and captions.
 */

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import BanterLoader from "../../components/BanterLoader";
import { formatISTDate } from "@/lib/ist-utils";

/**
 * Interface defining the structure of data to be published.
 * @property {string} headline - The main headline for the daily edition.
 * @property {File | null} photo - The photo file to be uploaded, or null if no new photo is selected.
 * @property {string} label - The caption or label for the uploaded photo.
 */
interface PublishData {
  headline: string;
  photo: File | null;
  label: string;
}

/**
 * Interface defining the structure for toast notifications.
 * @property {string} message - The message to be displayed in the toast.
 * @property {"success" | "error"} type - The type of toast, determining its styling (success or error).
 * @property {boolean} visible - A boolean indicating whether the toast is currently visible.
 */
interface ToastData {
  message: string;
  type: "success" | "error";
  visible: boolean;
}

/**
 * PublishPage component provides the UI for administrators to publish or edit daily content.
 * It handles user authentication, image processing, and interaction with the publishing API.
 * @returns {JSX.Element} The PublishPage UI, including login form or content publishing form.
 */
export default function PublishPage() {
  /**
   * State to track if the device is mobile (screen width less than 1024px).
   * The editor is designed for mobile devices.
   * @type {boolean}
   */
  const [isMobile, setIsMobile] = useState(false);
  /**
   * State to track if the component is running on the client-side.
   * Used to prevent hydration mismatches during server-side rendering.
   * @type {boolean}
   */
  const [isClient, setIsClient] = useState(false);
  /**
   * State to indicate if the initial loading phase is active.
   * Used to ensure a minimum loading time for a smoother user experience.
   * @type {boolean}
   */
  const [initialLoading, setInitialLoading] = useState(true);
  /**
   * State to track user authentication status.
   * @type {boolean}
   */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  /**
   * State to store the password entered by the user for authentication.
   * @type {string}
   */
  const [password, setPassword] = useState("");
  /**
   * State to indicate if an asynchronous operation (e.g., login, publish) is in progress.
   * @type {boolean}
   */
  const [loading, setLoading] = useState(false);
  /**
   * State to store the data for the current publication, including headline, photo, and label.
   * @type {PublishData}
   */
  const [publishData, setPublishData] = useState<PublishData>({
    headline: "",
    photo: null,
    label: "",
  });
  /**
   * State to indicate if the user is currently editing an existing daily edition.
   * @type {boolean}
   */
  const [isEditing, setIsEditing] = useState(false);
  /**
   * State to manage the display and content of toast notifications.
   * @type {ToastData}
   */
  const [toast, setToast] = useState<ToastData>({
    message: "",
    type: "success",
    visible: false,
  });
  /**
   * Ref for the hidden file input element, allowing programmatic click.
   * @type {React.RefObject<HTMLInputElement>}
   */
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    // Show loading for at least 500ms to prevent flashing screens
    const minimumLoadingTimer = setTimeout(() => {
      setInitialLoading(false);
    }, 500);

    // Check if already authenticated
    const authToken = localStorage.getItem("admin_auth");
    if (authToken) {
      const tokenData = JSON.parse(authToken);
      const tokenAge = Date.now() - tokenData.timestamp;
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

      if (tokenData.token && tokenAge < oneWeek) {
        setIsAuthenticated(true);
        loadExistingData();
      } else {
        localStorage.removeItem("admin_auth");
      }
    }

    return () => {
      window.removeEventListener("resize", checkDevice);
      clearTimeout(minimumLoadingTimer);
    };
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4000);
  };

  const loadExistingData = async () => {
    setLoading(true);
    try {
      // Get today's date in IST
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      const response = await fetch(`/api/daily?date=${today}`);
      const data = await response.json();

      if (data && data.headline) {
        setPublishData({
          headline: data.headline,
          photo: null,
          label: data.photo?.label || "",
        });
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error loading existing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem(
          "admin_auth",
          JSON.stringify({
            token,
            timestamp: Date.now(),
          })
        );
        setIsAuthenticated(true);
        loadExistingData();
      } else {
        showToast("Invalid credentials", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("Authentication failed - please try again", "error");
    }

    setLoading(false);
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = document.createElement("img");

      img.onload = () => {
        // Calculate new dimensions to maintain aspect ratio
        const maxWidth = 800;
        const maxHeight = 600;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        // Start with high quality and reduce until under 100KB
        let quality = 0.9;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (blob && (blob.size <= 100000 || quality <= 0.1)) {
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            "image/jpeg",
            quality
          );
        };

        tryCompress();
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const compressedFile = await compressImage(file);
        setPublishData((prev) => ({ ...prev, photo: compressedFile }));
        showToast("Photograph processed successfully", "success");
      } catch (error) {
        console.error("Error compressing image:", error);
        showToast("Error processing photograph - please try again", "error");
      }
      setLoading(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      // Get today's date in IST
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });

      formData.append("date", today);
      formData.append("headline", publishData.headline);
      formData.append("label", publishData.label);

      if (publishData.photo) {
        formData.append("photo", publishData.photo);
      }

      const authToken = localStorage.getItem("admin_auth");
      const token = authToken ? JSON.parse(authToken).token : "";

      const response = await fetch("/api/publish", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const successMessage = isEditing
          ? "Edition updated successfully!"
          : "Edition published successfully!";
        showToast(successMessage, "success");

        // Refresh the content instead of redirecting
        await loadExistingData();
      } else {
        const error = await response.json();
        showToast(error.message || "Failed to publish edition", "error");
      }
    } catch (error) {
      console.error("Publish error:", error);
      showToast("Failed to publish content - please try again", "error");
    }

    setLoading(false);
  };

  /**
   * Determines if a loading overlay should be shown.
   * True if `loading` (data fetching/submission) or `initialLoading` (minimum load time) is active.
   * @type {boolean}
   */
  const isLoading = loading || initialLoading;

  // Render nothing during server-side rendering or initial client render to prevent hydration mismatches.
  // This ensures the client-side rendering takes over smoothly.
  if (!isClient) {
    return null;
  }

  /**
   * Early return for desktop devices: displays a message indicating mobile-only access for the editor.
   * This prevents unnecessary rendering of complex components on unsupported devices.
   * @returns {JSX.Element}
   */
  if (!isMobile && !initialLoading) {
    return (
      <div className="min-h-screen bg-[#eee5da] text-[#262424] flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Image
            src="/logo.png"
            alt="Lumen Sigma Logo"
            className="w-32 h-32 mx-auto mb-4"
            width={128}
            height={128}
            priority
          />
          <h1 className="text-3xl font-bold mb-4 font-unifraktur">
            Lumen Sigma
          </h1>
          <p className="text-lg leading-relaxed font-newsreader">
            This is a mobile-only editor&apos;s page
            <br />
            Again, mostly because I am lazy :P
          </p>
        </div>
      </div>
    );
  }

  /**
   * Renders the login form if the user is not authenticated and initial loading is complete.
   * @returns {JSX.Element}
   */
  /**
   * Renders the login form if the user is not authenticated and initial loading is complete.
   * @returns {JSX.Element} The login form UI.
   */
  if (!isAuthenticated && !initialLoading) {
    return (
      <div className="min-h-screen bg-[#eee5da] text-[#262424] font-newsreader">
        {/* Toast Notification: Displays success or error messages. */}
        {toast.visible && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-40 max-w-md">
            <div
              className={`border-4 p-4 font-newsreader ${
                toast.type === "success"
                  ? "border-[#262424] bg-[#eee5da] text-[#262424]"
                  : "border-[#262424] bg-[#262424] text-[#eee5da]"
              }`}
            >
              <div className="text-center">
                <div className="text-xs uppercase tracking-widest mb-1">
                  {toast.type === "success" ? "SUCCESS" : "ERROR"}
                </div>
                <div className="font-bold text-sm">{toast.message}</div>
              </div>
            </div>
          </div>
        )}

        {/* Newspaper Header: Displays masthead for the editor login page. */}
        <header className="py-8 select-none">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center">
              <div className="border-t-2 border-b-2 border-[#262424] py-2 mb-4">
                <div className="grid grid-cols-3 items-center text-sm">
                  <span className="px-2 py-1 rounded justify-self-start">
                    ESTABLISHED 2025
                  </span>
                  <span className="px-2 py-1 rounded justify-self-center">
                    EDITOR ACCESS
                  </span>
                  <span className="px-2 py-1 rounded justify-self-end">
                    MOBILE ONLY
                  </span>
                </div>
              </div>

              <h1 className="text-6xl font-bold tracking-wider mb-4 text-center font-unifraktur">
                Lumen
                <br />
                <Image
                  src="/logo.png"
                  alt="Lumen Sigma Logo"
                  className="inline-block mx-6"
                  width={96}
                  height={96}
                  priority
                />
                <br />
                Sigma
              </h1>

              <div className="border-t-2 border-b-2 border-[#262424] py-2">
                EDITOR AUTHENTICATION REQUIRED
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area: Contains the login form. */}
        <main className="max-w-2xl mx-auto p-8">
          <div className="border-2 border-[#262424] p-8 bg-[#eee5da]">
            <h2 className="text-3xl font-bold mb-6 text-center font-newsreader">
              EDITOR LOGIN
            </h2>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 border-2 border-[#262424] bg-[#eee5da] text-[#262424] focus:outline-none font-newsreader"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full p-4 bg-[#262424] text-[#eee5da] font-bold uppercase tracking-wide disabled:opacity-50 border-2 border-[#262424] hover:bg-[#eee5da] hover:text-[#262424] transition-colors font-newsreader"
              >
                {loading ? "AUTHENTICATING..." : "AUTHENTICATE"}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  /**
   * Renders the publish form if the user is authenticated and initial loading is complete.
   * @returns {JSX.Element} The publish/edit form UI.
   */
  return (
    <div className="relative min-h-screen bg-[#eee5da] text-[#262424] font-newsreader">
      {/* Loading Overlay: Displays a loader while content is being processed or submitted. */}
      {isLoading && (
        <div className="fixed inset-0 bg-[#eee5da] bg-opacity-95 z-50 flex items-center justify-center">
          <BanterLoader />
        </div>
      )}

      {/* Toast Notification: Displays success or error messages. */}
      {toast.visible && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-40 max-w-md">
          <div
            className={`border-4 p-4 font-newsreader ${
              toast.type === "success"
                ? "border-[#262424] bg-[#eee5da] text-[#262424]"
                : "border-[#262424] bg-[#262424] text-[#eee5da]"
            }`}
          >
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest mb-1">
                {toast.type === "success" ? "SUCCESS" : "ERROR"}
              </div>
              <div className="font-bold text-sm">{toast.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* Newspaper Header: Displays masthead for the editor panel. */}
      <header className="py-8 select-none">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center">
            <div className="border-t-2 border-b-2 border-[#262424] py-2 mb-4">
              <div className="grid grid-cols-3 items-center text-sm">
                <span className="px-2 py-1 rounded justify-self-start">
                  ESTABLISHED 2025
                </span>
                <span className="px-2 py-1 rounded justify-self-center">
                  EDITOR PANEL
                </span>
                <span className="px-2 py-1 rounded justify-self-end">
                  {formatISTDate(new Date())}
                </span>
              </div>
            </div>

            <h1 className="text-6xl font-bold tracking-wider mb-4 text-center font-unifraktur">
              Lumen
              <br />
              <Image
                src="/logo.png"
                alt="Lumen Sigma Logo"
                className="inline-block mx-6"
                width={96}
                height={96}
                priority
              />
              <br />
              Sigma
            </h1>

            <div className="border-t-2 border-b-2 border-[#262424] py-2">
              {isEditing ? "CONTENT EDITOR" : "DAILY PUBLISHER"}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area: Contains the publish/edit form. */}
      <main className="max-w-4xl mx-auto p-8">
        <div className="border-4 border-[#262424] bg-[#eee5da]">
          {/* Form Header: Displays the title for the publish/edit form. */}
          <div className="border-b-2 border-[#262424] p-6 bg-[#eee5da]">
            <h2 className="text-4xl font-bold text-center font-newsreader">
              {isEditing ? "EDIT TODAY'S EDITION" : "PUBLISH TODAY'S EDITION"}
            </h2>
          </div>

          {/* Form Content: Contains input fields for headline, photo, and caption. */}
          <div className="p-8">
            <form onSubmit={handlePublish} className="space-y-8">
              {/* Headline Section: Input field for the main headline. */}
              <div className="border-2 border-[#262424] p-6">
                <h3 className="text-xl font-bold mb-4 uppercase tracking-wide border-b border-[#262424] pb-2">
                  Main Headline
                </h3>
                <input
                  type="text"
                  value={publishData.headline}
                  onChange={(e) =>
                    setPublishData((prev) => ({
                      ...prev,
                      headline: e.target.value,
                    }))
                  }
                  className="w-full p-4 border-2 border-[#262424] bg-[#eee5da] text-[#262424] focus:outline-none text-lg font-newsreader"
                  required
                />
              </div>

              {/* Photo Section: Input for uploading a featured photograph. */}
              <div className="border-2 border-[#262424] p-6">
                <h3 className="text-xl font-bold mb-4 uppercase tracking-wide border-b border-[#262424] pb-2">
                  Featured Photograph
                </h3>

                {/* Custom Upload Button: Triggers the hidden file input. */}
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 border-2 border-dashed border-[#262424] bg-[#eee5da] hover:bg-[#eee5da] transition-colors text-center font-newsreader"
                  >
                    <div className="space-y-2">
                      <div className="text-lg font-bold">
                        {publishData.photo
                          ? "CHANGE PHOTOGRAPH"
                          : "UPLOAD PHOTOGRAPH"}
                      </div>
                      <div className="text-sm text-[#262424]">
                        Tap to select an image file
                      </div>
                    </div>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    required={!isEditing}
                  />

                  {publishData.photo && (
                    <div className="border-2 border-[#262424] p-4 bg-[#ffdbc7]">
                      <p className="text-sm font-bold text-center">
                        PHOTOGRAPH SELECTED: {publishData.photo.name}
                      </p>
                      <p className="text-xs text-center mt-1 text-[#262424]">
                        Image will be automatically compressed to under 100KB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Caption Section: Textarea for entering the photograph's caption. */}
              <div className="border-2 border-[#262424] p-6">
                <h3 className="text-xl font-bold mb-4 uppercase tracking-wide border-b border-[#262424] pb-2">
                  Photograph Caption
                </h3>
                <textarea
                  value={publishData.label}
                  onChange={(e) =>
                    setPublishData((prev) => ({
                      ...prev,
                      label: e.target.value,
                    }))
                  }
                  className="w-full p-4 border-2 border-[#262424] bg-[#eee5da] text-[#262424] focus:outline-none h-32 font-newsreader resize-none"
                  placeholder="Enter descriptive caption for the photograph"
                  required
                />
              </div>

              {/* Information Box: Provides editorial notes and guidelines. */}
              <div className="border-2 border-[#262424] p-6 bg-[#ffdbc7]">
                <h3 className="text-lg font-bold mb-3 uppercase tracking-wide">
                  Editorial Notes
                </h3>
                <div className="text-sm space-y-1 font-newsreader">
                  <p>
                    • Poems, jokes, facts, and activities are automatically
                    sourced from various APIs
                  </p>
                  <p>
                    • Images are automatically compressed to ensure optimal
                    loading performance
                  </p>
                  <p>
                    • All content will be published for today&apos;s date in
                    Indian Standard Time
                  </p>
                </div>
              </div>

              {/* Action Button: Submits the form to publish or update the edition. */}
              <div className="flex w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className="p-4 border-2 border-[#262424] bg-[#262424] text-[#eee5da] font-bold uppercase tracking-wide disabled:opacity-50 hover:bg-[#eee5da] hover:text-[#262424] transition-colors font-newsreader w-full"
                >
                  {loading
                    ? "PUBLISHING..."
                    : isEditing
                    ? "UPDATE EDITION"
                    : "PUBLISH EDITION"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
