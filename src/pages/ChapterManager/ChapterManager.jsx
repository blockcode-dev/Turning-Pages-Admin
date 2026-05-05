/** @format */

import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./ChapterManager.scss";

import ChapterList from "./chapterComponent/ChapterList";
import AddChapterModal from "./chapterComponent/AddChapterModal";
import UploadChapterModal from "./chapterComponent/UploadChapterModal";
import BookHeader from "../Book/BookHeader/BookHeader";
import AIReportPanel from "./chapterComponent/AIReportPanel/AIReportPanel";
import PlagiarismModal from "./chapterComponent/PlagiarismModal/PlagiarismModal";
import FactCheckModal from "./chapterComponent/FactCheckModal/FactCheckModal";

import {
  GetBookByIdApi,
  GetBooksBySubmittion,
} from "../../api/operations/book.api";

import {
  CreateChapterApi,
  DeleteChapterApi,
  PlagiarismCheck,
  FactChecking,
  ConsistencyCheck,
  GenerateSummary,
  UpdateChapterApi,
} from "../../api/operations/chapter.api";

import { message, Modal } from "antd";
import Toolbar from "./chapterComponent/toolbar";
import ChapterEditor from "./chapterComponent/chapterEditor";
import PdfViewer from "./PdfViewer/PdfViewer";
import StripePayment from "../../component/StripePayment/StripePayment";

/* ================= TYPES ================= */

interface Chapter {
  id: number;
  title?: string;
  content?: string;
}

interface Book {
  id?: number;
  title?: string;
  book_chapters?: Chapter[];
}

type ViewMode = "edit" | "preview";

type AIResultMap = Record<
  number,
  {
    plagiarism?: any;
    fact?: any;
    consistency?: any;
    summary?: any;
  }
>;

export default function ChapterManager(): JSX.Element {
  const { bookId } = useParams<{ bookId: string }>();

  const [booksubmiition, setBookSubmitton] = useState<number | null>(null);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [paymentOpen, setPaymentOpen] = useState<boolean>(false);
  const [eventName, setEventName] = useState<string>("");

  const [bookDetails, setBookDetails] = useState<Book>({});
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editorContent, setEditorContent] = useState<string>("");

  const [viewMode, setViewMode] = useState<ViewMode>("edit");

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [uploadModalVisible, setUploadModalVisible] = useState<boolean>(false);

  const [isAIPanelOpen, setIsAIPanelOpen] = useState<boolean>(false);
  const [aiActiveTab, setAiActiveTab] = useState<string>("");
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const [plagiarismModalOpen, setPlagiarismModalOpen] = useState<boolean>(false);
  const [factModalOpen, setFactModalOpen] = useState<boolean>(false);

  const [aiResults, setAiResults] = useState<AIResultMap>(() => {
    const stored = localStorage.getItem("aiResults");
    return stored ? JSON.parse(stored) : {};
  });

  /* ================= EFFECTS ================= */

  useEffect(() => {
    localStorage.setItem("aiResults", JSON.stringify(aiResults));
  }, [aiResults]);

  useEffect(() => {
    if (bookId) fetchBookAndChapters();
  }, [bookId]);

  useEffect(() => {
    if (!selectedId) return;
    const chapter = chapters.find((c) => c.id === selectedId);
    setEditorContent(chapter?.content || "");
  }, [selectedId, chapters]);

  /* ================= FETCH ================= */

  const fetchBookAndChapters = async () => {
    setLoading(true);
    try {
      const res = await GetBookByIdApi(bookId);
      const data: Book = res?.data?.data || {};

      setBookDetails(data);
      setChapters(data?.book_chapters || []);

      if (data?.book_chapters?.length) {
        setSelectedId(data.book_chapters[0].id);
      }
    } catch {
      message.error("Failed to load book");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUBMISSION ================= */

  const createBookSubmission = async (event_name: string) => {
    try {
      const res = await GetBooksBySubmittion({
        book_id: bookId,
        event_name,
      });

      return res?.data?.data?.id || null;
    } catch {
      return null;
    }
  };

  const handleSubmitForEditing = async (event_name: string) => {
    try {
      setSubmitLoading(true);

      const submissionId = await createBookSubmission(event_name);
      if (!submissionId) return;

      setBookSubmitton(submissionId);
      setEventName(event_name);
      setPaymentOpen(true);
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ================= AI ================= */

  const handleRunAITool = async (tool: string) => {
    if (!selectedId) {
      message.warning("Select a chapter first");
      return;
    }

    try {
      let response;

      switch (tool) {
        case "plagiarism":
          setPlagiarismModalOpen(true);
          return;

        case "fact":
          setFactModalOpen(true);
          return;

        case "consistency":
          setIsAIPanelOpen(true);
          setAiActiveTab(tool);
          setAiLoading(true);
          response = await ConsistencyCheck(Number(bookId));
          break;

        case "summary":
          setIsAIPanelOpen(true);
          setAiActiveTab(tool);
          setAiLoading(true);
          response = await GenerateSummary(Number(bookId), selectedId);
          break;

        default:
          return;
      }

      const resultData = response?.data?.data || null;

      setAiResults((prev) => ({
        ...prev,
        [selectedId]: {
          ...prev[selectedId],
          [tool]: resultData,
        },
      }));
    } catch {
      message.error("AI Tool failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handlePlagiarismCheck = async (text: string) => {
    setPlagiarismModalOpen(false);
    setIsAIPanelOpen(true);
    setAiActiveTab("plagiarism");
    setAiLoading(true);

    try {
      const res = await PlagiarismCheck(text);
      const resultData = res?.data?.data || null;

      setAiResults((prev) => ({
        ...prev,
        [selectedId!]: {
          ...prev[selectedId!],
          plagiarism: resultData,
        },
      }));
    } catch {
      message.error("Plagiarism check failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleFactCheck = async (text: string) => {
    setFactModalOpen(false);
    setIsAIPanelOpen(true);
    setAiActiveTab("fact");
    setAiLoading(true);

    try {
      const res = await FactChecking(text);
      const resultData = res?.data?.data || null;

      setAiResults((prev) => ({
        ...prev,
        [selectedId!]: {
          ...prev[selectedId!],
          fact: resultData,
        },
      }));
    } catch {
      message.error("Fact check failed");
    } finally {
      setAiLoading(false);
    }
  };

  const currentAIData = selectedId ? aiResults[selectedId] || {} : {};

  /* ================= SAVE ================= */

  const handleSaveChapter = async () => {
    if (!selectedId) return;

    setSaving(true);

    try {
      const chapter = chapters.find((c) => c.id === selectedId);

      await UpdateChapterApi({
        title: chapter?.title,
        book_id: bookId,
        chapter_id: selectedId,
        content: editorContent,
      });

      message.success("Chapter saved successfully");
      fetchBookAndChapters();
    } catch {
      message.error("Failed to save chapter");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateChapter = async (payload: any) => {
    try {
      const res = await CreateChapterApi(payload);
      message.success(res?.data?.message || "Chapter created");

      setAddModalVisible(false);
      fetchBookAndChapters();
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="chapter-manager">
      <aside className="chapter-sider">
        <div className="sider-header">
          <Link to="/dashboard" className="back-btn">
            <ArrowLeft size={18} /> Dashboard
          </Link>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <ChapterList
            chapters={chapters}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={() => setAddModalVisible(true)}
            onDelete={DeleteChapterApi}
          />
        )}
      </aside>

      <main className="chapter-content-area">
        <BookHeader
          bookIdDetails={bookDetails}
          title={bookDetails?.title || "Untitled Book"}
          bookId={bookId}
          onSubmit={handleSubmitForEditing}
          loading={submitLoading}
        />

        <Toolbar
          chapterTitle={chapters.find((c) => c.id === selectedId)}
          saving={saving}
          onSave={handleSaveChapter}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onToggleAIPanel={() => setIsAIPanelOpen(!isAIPanelOpen)}
          isAIPanelOpen={isAIPanelOpen}
          onRunAITool={handleRunAITool}
          activeTool={aiActiveTab}
          onOpenUploadModal={() => setUploadModalVisible(true)}
        />

        <div className="content-layout">
          <div className="editor-container">
            {viewMode === "edit" ? (
              <ChapterEditor
                content={editorContent}
                setContent={setEditorContent}
              />
            ) : (
              <PdfViewer htmlContent={editorContent} />
            )}
          </div>

          {isAIPanelOpen && (
            <div className="report-section">
              <AIReportPanel
                activeTab={aiActiveTab}
                setActiveTab={setAiActiveTab}
                data={currentAIData}
                loading={aiLoading}
              />
            </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      <AddChapterModal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        onCreate={handleCreateChapter}
        bookId={bookId}
      />

      <UploadChapterModal
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        onUploadSuccess={(text: string) => setEditorContent(text)}
      />

      <PlagiarismModal
        open={plagiarismModalOpen}
        onClose={() => setPlagiarismModalOpen(false)}
        chapterText={editorContent}
        onCheckPlagiarism={handlePlagiarismCheck}
      />

      <FactCheckModal
        open={factModalOpen}
        onClose={() => setFactModalOpen(false)}
        chapterText={editorContent}
        onCheckFact={handleFactCheck}
      />

      <Modal
        open={paymentOpen}
        footer={null}
        destroyOnClose
        onCancel={() => setPaymentOpen(false)}
        title="Complete Payment"
      >
        <StripePayment
          amount={40}
          payment_for="book_submission"
          book_submission_id={booksubmiition}
          onPaymentSuccess={() => setPaymentOpen(false)}
          onCloseModal={() => setPaymentOpen(false)}
        />
      </Modal>
    </div>
  );
}