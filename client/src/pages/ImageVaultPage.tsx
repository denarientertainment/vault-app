/**
 * SecureVault — Image Vault Page
 * Upload, view, organize into albums, and delete private images stored in S3.
 */

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  X,
  ZoomIn,
  FileImage,
  AlertCircle,
  Download,
  FolderOpen,
  FolderPlus,
  Tag,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const gold = "oklch(0.72 0.12 75)";
const navy = "oklch(0.13 0.03 240)";
const navyMid = "oklch(0.17 0.025 240)";
const navyLight = "oklch(0.21 0.022 240)";
const textPrimary = "oklch(0.93 0.01 240)";
const textMuted = "oklch(0.55 0.015 240)";

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const PRESET_ALBUMS = ["IDs & Documents", "Screenshots", "Personal", "Work", "Other"];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageVaultPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxName, setLightboxName] = useState<string>("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null); // null = All
  const [uploadAlbum, setUploadAlbum] = useState<string>("");
  const [albumPickerId, setAlbumPickerId] = useState<number | null>(null); // image being reassigned
  const [customAlbum, setCustomAlbum] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.images.list.useQuery();

  const uploadMutation = trpc.images.upload.useMutation({
    onSuccess: () => {
      utils.images.list.invalidate();
      toast.success("Image uploaded to vault.");
      setUploading(false);
    },
    onError: (err) => {
      toast.error("Upload failed: " + err.message);
      setUploading(false);
    },
  });

  const deleteMutation = trpc.images.delete.useMutation({
    onSuccess: () => {
      utils.images.list.invalidate();
      toast.success("Image removed from vault.");
      setDeletingId(null);
    },
    onError: (err) => {
      toast.error("Delete failed: " + err.message);
      setDeletingId(null);
    },
  });

  const setAlbumMutation = trpc.images.setAlbum.useMutation({
    onSuccess: () => {
      utils.images.list.invalidate();
      setAlbumPickerId(null);
      toast.success("Album updated.");
    },
    onError: (err) => toast.error("Failed to update album: " + err.message),
  });

  const processFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG, GIF, and WebP images are supported.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SIZE_MB} MB.`);
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      uploadMutation.mutate({
        name: file.name,
        mimeType: file.type,
        size: file.size,
        dataBase64: base64,
        album: uploadAlbum || undefined,
      } as Parameters<typeof uploadMutation.mutate>[0]);
    };
    reader.readAsDataURL(file);
  }, [uploadMutation, uploadAlbum]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const images = data?.images ?? [];

  // Derive unique albums from images
  const albums = Array.from(new Set(images.map((img) => img.album).filter(Boolean) as string[]));

  // Filter images by active album
  const filteredImages = activeAlbum
    ? images.filter((img) => img.album === activeAlbum)
    : images;

  return (
    <div className="flex flex-col h-full" style={{ color: textPrimary, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${gold}18` }}>
            <ImageIcon size={16} style={{ color: gold }} />
          </div>
          <div>
            <h2 className="font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>Image Vault</h2>
            <p className="text-xs" style={{ color: textMuted }}>{images.length} image{images.length !== 1 ? "s" : ""} · {albums.length} album{albums.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          size="sm"
          style={{ background: gold, color: navy }}
        >
          <Upload size={13} className="mr-1.5" />
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Album filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveAlbum(null)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: activeAlbum === null ? gold : navyMid,
              color: activeAlbum === null ? navy : textMuted,
              border: `1px solid ${activeAlbum === null ? gold : "oklch(1 0 0 / 8%)"}`,
            }}
          >
            All ({images.length})
          </button>
          {albums.map((album) => {
            const count = images.filter((img) => img.album === album).length;
            return (
              <button
                key={album}
                onClick={() => setActiveAlbum(album)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: activeAlbum === album ? `${gold}20` : navyMid,
                  color: activeAlbum === album ? gold : textMuted,
                  border: `1px solid ${activeAlbum === album ? `${gold}50` : "oklch(1 0 0 / 8%)"}`,
                }}
              >
                <FolderOpen size={11} />
                {album} ({count})
              </button>
            );
          })}
        </div>

        {/* Upload album selector */}
        <div className="rounded-xl p-4 space-y-3" style={{ background: navyMid, border: "1px solid oklch(1 0 0 / 8%)" }}>
          <div className="flex items-center gap-2 text-xs font-medium" style={{ color: textMuted }}>
            <FolderPlus size={13} />
            Album for next upload (optional)
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setUploadAlbum("")}
              className="px-2.5 py-1 rounded-lg text-xs transition-all"
              style={{
                background: uploadAlbum === "" ? `${gold}20` : navyLight,
                color: uploadAlbum === "" ? gold : textMuted,
                border: `1px solid ${uploadAlbum === "" ? `${gold}40` : "oklch(1 0 0 / 8%)"}`,
              }}
            >
              No album
            </button>
            {PRESET_ALBUMS.map((preset) => (
              <button
                key={preset}
                onClick={() => setUploadAlbum(preset)}
                className="px-2.5 py-1 rounded-lg text-xs transition-all"
                style={{
                  background: uploadAlbum === preset ? `${gold}20` : navyLight,
                  color: uploadAlbum === preset ? gold : textMuted,
                  border: `1px solid ${uploadAlbum === preset ? `${gold}40` : "oklch(1 0 0 / 8%)"}`,
                }}
              >
                {preset}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Or type a custom album name..."
              value={customAlbum}
              onChange={(e) => setCustomAlbum(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && customAlbum.trim()) { setUploadAlbum(customAlbum.trim()); setCustomAlbum(""); } }}
              className="text-xs h-8"
              style={{ background: navyLight, borderColor: "oklch(1 0 0 / 10%)", color: textPrimary }}
            />
            <Button
              size="sm"
              variant="outline"
              disabled={!customAlbum.trim()}
              onClick={() => { if (customAlbum.trim()) { setUploadAlbum(customAlbum.trim()); setCustomAlbum(""); } }}
              style={{ background: navyLight, borderColor: "oklch(1 0 0 / 10%)", color: textPrimary, height: 32 }}
            >
              Set
            </Button>
          </div>
          {uploadAlbum && (
            <div className="text-xs" style={{ color: gold }}>
              Next upload will go to: <strong>{uploadAlbum}</strong>
            </div>
          )}
        </div>

        {/* Drop zone */}
        <div
          className="rounded-xl border-2 border-dashed p-8 text-center transition-all cursor-pointer"
          style={{
            borderColor: isDragging ? gold : "oklch(1 0 0 / 12%)",
            background: isDragging ? `${gold}08` : "transparent",
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: navyLight }}>
              <FileImage size={20} style={{ color: isDragging ? gold : textMuted }} />
            </div>
            <p className="text-sm font-medium" style={{ color: isDragging ? gold : textPrimary }}>
              {isDragging ? "Drop to upload" : "Drag & drop an image here"}
            </p>
            <p className="text-xs" style={{ color: textMuted }}>
              JPEG, PNG, GIF, WebP — up to {MAX_SIZE_MB} MB
              {uploadAlbum && <span style={{ color: gold }}> → {uploadAlbum}</span>}
            </p>
          </div>
        </div>

        {/* Gallery */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ background: navyMid }} />
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: navyMid }}>
              <ImageIcon size={24} style={{ color: textMuted }} />
            </div>
            <p className="text-sm font-medium" style={{ color: textPrimary }}>
              {activeAlbum ? `No images in "${activeAlbum}"` : "No images yet"}
            </p>
            <p className="text-xs" style={{ color: textMuted }}>
              {activeAlbum ? "Upload an image and assign it to this album." : "Upload your first image to store it securely."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredImages.map((img) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                  style={{ background: navyMid }}
                  onClick={() => { setLightboxUrl(img.url); setLightboxName(img.name); }}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Album badge */}
                  {img.album && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                      style={{ background: "oklch(0 0 0 / 60%)", color: gold }}>
                      <Tag size={9} />
                      {img.album}
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2"
                    style={{ background: "oklch(0 0 0 / 55%)" }}>
                    <div className="flex justify-end gap-1.5">
                      {/* Album assign button */}
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: "oklch(0.17 0.025 240 / 90%)" }}
                        onClick={(e) => { e.stopPropagation(); setAlbumPickerId(img.id); }}
                        title="Assign album"
                      >
                        <Tag size={12} style={{ color: gold }} />
                      </button>
                      {/* Delete button */}
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: "oklch(0.577 0.245 27.325 / 80%)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingId(img.id);
                          deleteMutation.mutate({ id: img.id });
                        }}
                        disabled={deletingId === img.id}
                      >
                        {deletingId === img.id
                          ? <span className="text-xs text-white">...</span>
                          : <Trash2 size={12} className="text-white" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ZoomIn size={12} className="text-white opacity-70" />
                      <span className="text-xs text-white truncate">{img.name}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Size notice */}
        <div className="flex items-center gap-2 text-xs" style={{ color: textMuted }}>
          <AlertCircle size={11} />
          <span>Images are stored securely in your private vault. Only you can access them.</span>
        </div>
      </div>

      {/* Album Picker Modal */}
      <AnimatePresence>
        {albumPickerId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "oklch(0 0 0 / 70%)", backdropFilter: "blur(6px)" }}
            onClick={() => setAlbumPickerId(null)}
          >
            <motion.div
              initial={{ scale: 0.93 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.93 }}
              className="w-full max-w-sm rounded-2xl p-5 space-y-4"
              style={{ background: "oklch(0.17 0.025 240)", border: "1px solid oklch(1 0 0 / 10%)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>Assign Album</h3>
                <button onClick={() => setAlbumPickerId(null)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: navyLight }}>
                  <X size={13} style={{ color: textMuted }} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAlbumMutation.mutate({ id: albumPickerId, album: null })}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{ background: navyLight, color: textMuted, border: "1px solid oklch(1 0 0 / 8%)" }}
                >
                  No album
                </button>
                {[...PRESET_ALBUMS, ...albums.filter((a) => !PRESET_ALBUMS.includes(a))].map((album) => {
                  const currentImg = images.find((i) => i.id === albumPickerId);
                  const isActive = currentImg?.album === album;
                  return (
                    <button
                      key={album}
                      onClick={() => setAlbumMutation.mutate({ id: albumPickerId, album })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{
                        background: isActive ? `${gold}20` : navyLight,
                        color: isActive ? gold : textMuted,
                        border: `1px solid ${isActive ? `${gold}40` : "oklch(1 0 0 / 8%)"}`,
                      }}
                    >
                      {isActive && <Check size={10} />}
                      {album}
                    </button>
                  );
                })}
              </div>
              {/* Custom album input */}
              <div className="flex gap-2">
                <Input
                  placeholder="New album name..."
                  value={customAlbum}
                  onChange={(e) => setCustomAlbum(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customAlbum.trim()) {
                      setAlbumMutation.mutate({ id: albumPickerId, album: customAlbum.trim() });
                      setCustomAlbum("");
                    }
                  }}
                  className="text-xs h-8"
                  style={{ background: navyLight, borderColor: "oklch(1 0 0 / 10%)", color: textPrimary }}
                />
                <Button
                  size="sm"
                  disabled={!customAlbum.trim() || setAlbumMutation.isPending}
                  onClick={() => {
                    if (customAlbum.trim()) {
                      setAlbumMutation.mutate({ id: albumPickerId, album: customAlbum.trim() });
                      setCustomAlbum("");
                    }
                  }}
                  style={{ background: gold, color: navy, height: 32 }}
                >
                  Create
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "oklch(0 0 0 / 85%)", backdropFilter: "blur(8px)" }}
            onClick={() => setLightboxUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxUrl}
                alt={lightboxName}
                className="max-w-full max-h-[80vh] rounded-xl object-contain"
                style={{ boxShadow: "0 25px 60px oklch(0 0 0 / 60%)" }}
              />
              <div className="absolute top-3 right-3 flex gap-2">
                <a
                  href={lightboxUrl}
                  download={lightboxName}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "oklch(0.17 0.025 240 / 90%)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={14} style={{ color: textPrimary }} />
                </a>
                <button
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "oklch(0.17 0.025 240 / 90%)" }}
                  onClick={() => setLightboxUrl(null)}
                >
                  <X size={14} style={{ color: textPrimary }} />
                </button>
              </div>
              <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg text-xs" style={{ background: "oklch(0.17 0.025 240 / 90%)", color: textMuted }}>
                {lightboxName}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
