/** @format */

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";
import { BookPlus, Loader2 } from "lucide-react";
import "./AddChapterModal.scss";

interface AddChapterModalProps {
	open: boolean;
	onClose: () => void;
	onCreate: (title: string) => void;
}

const AddChapterModal = ({ open, onClose, onCreate }: AddChapterModalProps) => {
	const [title, setTitle] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		if (!title.trim()) return;

		try {
			setLoading(true);

			await onCreate(title); // ✅ USE THIS

			setTitle("");
			onClose();
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="add-chapter-dialog">
				<div className="modal-top-strip" />

				<div className="modal-inner">
					{/* Header */}
					<div className="modal-header">
						<div className="modal-icon-wrap">
							<BookPlus size={18} />
						</div>
						<div className="modal-title-group">
							<DialogTitle className="modal-title">New Chapter</DialogTitle>
							<p className="modal-subtitle">
								Give your chapter a title to get started
							</p>
						</div>
						{/* <button className="modal-close-btn" onClick={onClose}>
              <X size={14} />
            </button> */}
					</div>

					{/* Input */}
					<div className="modal-field">
						<label className="modal-label">Chapter Title</label>
						<input
							className="modal-input"
							placeholder="e.g. The Beginning, Chapter One…"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
							autoFocus
						/>
					</div>

					{/* Footer */}
					<div className="modal-footer">
						<button className="btn-cancel" onClick={onClose}>
							Cancel
						</button>
						<button
							className={`btn-create ${title.trim() ? "ready" : ""}`}
							onClick={handleSubmit}
							disabled={!title.trim() || loading}
						>
							{loading ? (
								<>
									<Loader2 size={14} className="spin" /> Creating…
								</>
							) : (
								<>
									<BookPlus size={14} /> Create Chapter
								</>
							)}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AddChapterModal;
