"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import BanterLoader from "../../components/BanterLoader";
import { formatISTDate } from "@/lib/ist-utils";

interface PublishData {
  headline: string;
  photo: File | null;
  label: string;
}

interface ToastData {
  message: string;
  type: "success" | "error";
  visible: boolean;
}

export default function PublishPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishData, setPublishData] = useState<PublishData>({
    headline: "",
    photo: null,
    label: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState<ToastData>({
    message: "",
    type: "success",
    visible: false,
  });
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

  // Show loading overlay while data is loading or during initial load
  const isLoading = loading || initialLoading;

  // Show nothing during SSR or initial loading
  if (!isClient) {
    return null;
  }

  // Early return for desktop devices to prevent loading any content components
  if (!isMobile && !initialLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-8">
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

  // Login form
  if (!isAuthenticated && !initialLoading) {
    return (
      <div className="min-h-screen bg-white text-black font-newsreader">
        {/* Newspaper Header */}
        <header className="py-8 select-none">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center">
              <div className="border-t-2 border-b-2 border-black py-2 mb-4">
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

              <div className="border-t-2 border-b-2 border-black py-2">
                EDITOR AUTHENTICATION REQUIRED
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto p-8">
          <div className="border-2 border-black p-8 bg-white">
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
                  className="w-full p-4 border-2 border-black bg-white text-black focus:outline-none font-newsreader"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full p-4 bg-black text-white font-bold uppercase tracking-wide disabled:opacity-50 border-2 border-black hover:bg-white hover:text-black transition-colors font-newsreader"
              >
                {loading ? "AUTHENTICATING..." : "AUTHENTICATE"}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // Publish form
  return (
    <div className="relative min-h-screen bg-white text-black font-newsreader">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-95 z-50 flex items-center justify-center">
          <BanterLoader />
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-40 max-w-md">
          <div
            className={`border-4 p-4 font-newsreader ${
              toast.type === "success"
                ? "border-black bg-white text-black"
                : "border-black bg-black text-white"
            }`}
          >
            <div className="text-center">
              <div className="text-xs uppercase tracking-widest mb-1">
                {toast.type === "success"
                  ? "EDITORIAL SUCCESS"
                  : "EDITORIAL ERROR"}
              </div>
              <div className="font-bold text-sm">{toast.message}</div>
            </div>
          </div>
        </div>
      )}

      {/* Newspaper Header */}
      <header className="py-8 select-none">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center">
            <div className="border-t-2 border-b-2 border-black py-2 mb-4">
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

            <div className="border-t-2 border-b-2 border-black py-2">
              {isEditing ? "CONTENT EDITOR" : "DAILY PUBLISHER"}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <div className="border-4 border-black bg-white">
          {/* Form Header */}
          <div className="border-b-2 border-black p-6 bg-gray-50">
            <h2 className="text-4xl font-bold text-center font-newsreader">
              {isEditing ? "EDIT TODAY'S EDITION" : "PUBLISH TODAY'S EDITION"}
            </h2>
            <p className="text-center text-lg mt-2 font-newsreader">
              {formatISTDate(new Date())}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={handlePublish} className="space-y-8">
              {/* Headline Section */}
              <div className="border-2 border-black p-6">
                <h3 className="text-xl font-bold mb-4 uppercase tracking-wide border-b border-black pb-2">
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
                  className="w-full p-4 border-2 border-black bg-white text-black focus:outline-none text-lg font-newsreader"
                  placeholder="Enter today's headline"
                  required
                />
              </div>

              {/* Photo Section */}
              <div className="border-2 border-black p-6">
                <h3 className="text-xl font-bold mb-4 uppercase tracking-wide border-b border-black pb-2">
                  Featured Photograph
                </h3>

                {/* Custom Upload Button */}
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 border-2 border-dashed border-black bg-gray-50 hover:bg-gray-100 transition-colors text-center font-newsreader"
                  >
                    <div className="space-y-2">
                      <div className="text-lg font-bold">
                        {publishData.photo
                          ? "CHANGE PHOTOGRAPH"
                          : "UPLOAD PHOTOGRAPH"}
                      </div>
                      <div className="text-sm text-gray-600">
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
                    <div className="border-2 border-black p-4 bg-yellow-50">
                      <p className="text-sm font-bold text-center">
                        PHOTOGRAPH SELECTED: {publishData.photo.name}
                      </p>
                      <p className="text-xs text-center mt-1 text-gray-600">
                        Image will be automatically compressed to under 100KB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Caption Section */}
              <div className="border-2 border-black p-6">
                <h3 className="text-xl font-bold mb-4 uppercase tracking-wide border-b border-black pb-2">
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
                  className="w-full p-4 border-2 border-black bg-white text-black focus:outline-none h-32 font-newsreader resize-none"
                  placeholder="Enter descriptive caption for the photograph"
                  required
                />
              </div>

              {/* Information Box */}
              <div className="border-2 border-black p-6 bg-yellow-50">
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

              {/* Action Button */}
              <div className="flex w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className="p-4 border-2 border-black bg-black text-white font-bold uppercase tracking-wide disabled:opacity-50 hover:bg-white hover:text-black transition-colors font-newsreader w-full"
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
