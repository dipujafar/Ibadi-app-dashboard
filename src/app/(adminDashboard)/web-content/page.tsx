"use client";
import { useGetWebContentQuery, useUpdateContentMutation } from "@/redux/api/webContentApi";
import dynamic from "next/dynamic";
import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
// @ts-ignore
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";


// ─── Types ────────────────────────────────────────────────────────────────────
interface WebSection {
    id: string;
    image?: string;
    title: string;
    content: string;
    buttonText: string;
    buttonLink: string;
    createdAt: string;
    updatedAt: string;
}

interface SavePayload {
    id: string;
    data: FormData;
}

interface SectionEditorProps {
    section: WebSection;
    index: number;
    onSave: (payload: SavePayload) => Promise<void>;
}

// ─── Quill (dynamic — no SSR) ─────────────────────────────────────────────────
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const toolbarOptions = [
    ["image"],
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    [{ color: [] }, { background: [] }],
];
const moduleConest = { toolbar: toolbarOptions };

// ─── Constants ────────────────────────────────────────────────────────────────
const SECTION_LABELS = ["About Us",  "Better Care Banner" ,"Care Center Hero"];
const SECTION_ICONS = ["🏥", "⏰", "🌟" ];

// ─── SectionEditor ────────────────────────────────────────────────────────────
const SectionEditor: FC<SectionEditorProps> = ({ section, index, onSave }) => {
    const [title, setTitle] = useState<string>(section.title ?? "");
    const [content, setContent] = useState<string>(section.content ?? "");
    const [buttonText, setButtonText] = useState<string>(section.buttonText ?? "");
    const [buttonLink, setButtonLink] = useState<string>(section.buttonLink ?? "#");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(section.image ?? null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTitle(section.title ?? "");
        setContent(section.content ?? "");
        setButtonText(section.buttonText ?? "");
        setButtonLink(section.buttonLink ?? "#");
        setImagePreview(section.image ?? null);
    }, [section]);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleSubmit = async () => {
        setSaving(true);
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("buttonText", buttonText);
        formData.append("buttonLink", buttonLink);
        if (imageFile) formData.append("image", imageFile);

        try {
            await onSave({ id: section.id, data: formData });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } finally {
            setSaving(false);
        }
    };

    // Quill needs a small global override for border-radius — kept minimal
    const quillGlobal = `
    .ql-toolbar.ql-snow { border-radius: 8px 8px 0 0; border-color: #e2e8f0 !important; background: #f8fafc; }
    .ql-container.ql-snow { border-radius: 0 0 8px 8px; border-color: #e2e8f0 !important; font-size: 14px; min-height: 140px; }
    .ql-editor { min-height: 120px; }
    .ql-container.ql-snow:focus-within { border-color: #0bc5b5 !important; box-shadow: 0 0 0 3px rgba(11,197,181,.12); }
    @keyframes spin-wce { to { transform: rotate(360deg); } }
    .spin-wce { animation: spin-wce .7s linear infinite; }
  `;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-7">
            <style>{quillGlobal}</style>

            {/* ── Card header ── */}
            <div className="flex items-center gap-4 px-7 py-5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <span className="text-3xl">{SECTION_ICONS[index]}</span>
                <div>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        Section {index + 1}
                    </p>
                    <h3 className="text-[17px] font-bold text-slate-700">
                        {SECTION_LABELS[index]}
                    </h3>
                </div>

                <div className="flex-1" />


            </div>

            {/* ── Image upload ── */}
            <div className="px-7 pt-6">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Section Image
                </label>
                <div className="flex items-center gap-4">
                    {/* Dropzone */}
                    <div
                        onClick={() => fileRef.current?.click()}
                        className="group relative w-44 h-28 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer overflow-hidden bg-slate-50 flex-shrink-0 transition-colors hover:border-teal-400"
                    >
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Section preview"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-1 text-slate-400 text-xs text-center px-2">
                                <span className="text-2xl">📷</span>
                                <p>Click to upload</p>
                                <p className="text-[10px] text-slate-300">JPG, PNG, WEBP</p>
                            </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-teal-500/75 flex items-center justify-center text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            Change Image
                        </div>
                    </div>

                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />

                    {imagePreview && (
                        <button
                            onClick={handleRemoveImage}
                            className="self-center px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            ✕ Remove
                        </button>
                    )}
                </div>
            </div>

            {/* ── Title ── */}
            <div className="px-7 pt-5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Title
                </label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Section title…"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:bg-white"
                />
            </div>

            {/* ── Content (ReactQuill) ── */}
            <div className="px-7 pt-5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Content
                </label>
                <div className="quill-wrapper-container">
                    <ReactQuill
                        modules={moduleConest}
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        placeholder="Start writing…"
                    />
                </div>
            </div>

            {/* ── Button text + link ── */}
            <div className="px-7 pt-5 pb-7 grid grid-cols-2 gap-5">
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Button Text
                    </label>
                    <input
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                        placeholder="e.g. Booking"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:bg-white"
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Button Link
                    </label>
                    <input
                        value={buttonLink}
                        onChange={(e) => setButtonLink(e.target.value)}
                        placeholder="e.g. /booking or #"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 outline-none transition-all focus:border-teal-400 focus:ring-2 focus:ring-teal-100 focus:bg-white"
                    />
                </div>
            </div>
            <div className="p-2 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className={`
            flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
            text-white transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed
            ${saved
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : saving
                                ? "bg-slate-400 cursor-not-allowed"
                                : "bg-teal-500 hover:bg-teal-600 hover:-translate-y-px hover:shadow-lg hover:shadow-teal-200"
                        }
          `}
                >
                    {saving ? (
                        <>
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white spin-wce inline-block" />
                            Saving…
                        </>
                    ) : saved ? (
                        <>
                            <span>✓</span> Saved!
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </button>
            </div>
        </div>
    );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const WebContentEditor: FC = () => {
    const { data, isLoading, isError } = useGetWebContentQuery(undefined);
    const [updateProfile] = useUpdateContentMutation();

    const sections: WebSection[] = data?.data ?? [];

    const handleSave =async (payload: SavePayload): Promise<void> =>{
        try {
            await updateProfile(payload).unwrap();
            toast.success("Successfully updated content", { duration: 1000 });
        } catch (error: any) {
            toast.error(error?.data?.message);
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 px-6 py-10 pb-20">
            {/* ── Page header ── */}
            <div className=" flex items-end gap-4 border-b-2 border-slate-200 pb-5 mb-9">
                <div>
                    <p className="text-sm text-slate-400 mb-0.5">Admin Panel</p>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Web Content Manager
                    </h1>
                </div>
                <div className="ml-auto">
                    <span className="bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-4 py-1 text-xs font-semibold">
                        {sections.length} Section{sections.length !== 1 ? "s" : ""}
                    </span>
                </div>
            </div>

            {/* ── Loading ── */}
            {isLoading && (
                <div className=" mt-20 text-center">
                    <div
                        className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-teal-500 mx-auto mb-4 spin-wce"
                        style={{ animation: "spin-wce .9s linear infinite" }}
                    />
                    <p className="text-sm text-slate-400">Loading content sections…</p>
                    <style>{`@keyframes spin-wce { to { transform: rotate(360deg); } } .spin-wce { animation: spin-wce .9s linear infinite; }`}</style>
                </div>
            )}

            {/* ── Error ── */}
            {isError && (
                <div className="max-w-4xl mx-auto mt-20">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 font-medium text-center">
                        ⚠️ Failed to load content. Please refresh the page.
                    </div>
                </div>
            )}

            {/* ── Section editors ── */}
            {!isLoading &&
                !isError &&
                sections.map((section, i) => (
                    <SectionEditor
                        key={section.id}
                        section={section}
                        index={i}
                        onSave={handleSave}
                    />
                ))}
        </div>
    );
};

export default dynamic(() => Promise.resolve(WebContentEditor), { ssr: false });