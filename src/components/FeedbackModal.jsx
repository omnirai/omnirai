import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { sendDislikeFeedbackReport } from '../engine/quickAiEngine';

const FEEDBACK_TAGS = [
  'Incorrect or incomplete',
  'Not what I asked for',
  'Slow or buggy',
  'Style or tone',
  'Safety or legal concern',
  'Other'
];

export function FeedbackModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  feedbackContext = {}
}) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      await sendDislikeFeedbackReport({
        userEmail: feedbackContext.userEmail || '',
        userName: feedbackContext.userName || '',
        categories: selectedTags.length > 0 ? selectedTags : ['Dislike / Unsatisfactory'],
        details: details.trim(),
        userQuery: feedbackContext.userQuery || '',
        aiResponse: feedbackContext.aiResponse || '',
        model: feedbackContext.model || 'OMNIRA (GPT-4o)',
        conversationId: feedbackContext.conversationId || null
      });

      setSubmitted(true);
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      setTimeout(() => {
        setSubmitted(false);
        setSelectedTags([]);
        setDetails('');
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      // Still close smoothly
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[500px] bg-white dark:bg-[#212121] text-[var(--text-primary)] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800/80 overflow-hidden animate-in zoom-in-95 duration-150 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">
            Share feedback
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[1.8]" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              Thank you for your feedback!
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs">
              Your report has been sent to our administrator to help improve OMNIRA AI.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {FEEDBACK_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all select-none cursor-pointer border ${
                      isSelected 
                        ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-black font-semibold shadow-xs' 
                        : 'bg-transparent border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Details Textarea */}
            <div>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Share details (optional)"
                rows={4}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700/90 bg-transparent px-3.5 py-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Privacy & Conversation Notice */}
            <div className="rounded-xl bg-neutral-100 dark:bg-neutral-800/50 p-3 text-[12px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Your conversation will be included with your feedback to help improve OMNIRA.{' '}
              <span 
                onClick={() => alert("Feedback and conversation excerpts are sent securely to administrators to evaluate model response quality, safety, and correctness.")}
                className="underline hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
              >
                Learn more
              </span>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-full text-sm font-semibold bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default FeedbackModal;
