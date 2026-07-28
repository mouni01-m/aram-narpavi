"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Film,
  ImageIcon,
  MessageSquareReply,
  RefreshCw,
  Search,
  ShieldAlert,
  Star,
  StarHalf,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import {
  deleteAdminReview,
  getAdminReviews,
  updateAdminReview,
  type AdminReview,
  type ReviewStatus,
} from "@/services/reviewAdminService";

type StatusFilter = "all" | ReviewStatus;
type StarFilter = "all" | "5" | "4" | "3" | "2" | "1";
type MediaFilter = "all" | "images" | "videos" | "none";
type DateFilter = "all" | "today" | "yesterday" | "7-days" | "30-days" | "custom";
type ReviewSort = "newest" | "oldest" | "highest-rating" | "lowest-rating" | "most-helpful";

const REVIEWS_PER_PAGE = 10;

function timestampMs(value: unknown) {
  if (value && typeof value === "object") {
    if ("toMillis" in value && typeof value.toMillis === "function") return value.toMillis();
    if ("seconds" in value && typeof value.seconds === "number") return value.seconds * 1000;
  }
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function formatDate(value: unknown, includeTime = false) {
  const ms = timestampMs(value);
  if (!ms) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(ms));
}

function reviewCode(review: AdminReview) {
  return `REV-${review.id.slice(0, 8).toUpperCase()}`;
}

function reviewKey(review: AdminReview) {
  return `${review.productId}-${review.id}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

function safeImageSrc(src: string) {
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/") || src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }

  console.error("Invalid review image URL, using fallback:", src);
  return "/images/product-placeholder.png";
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CU";
}

function withinDateFilter(review: AdminReview, filter: DateFilter, customFrom: string, customTo: string) {
  if (filter === "all") return true;
  const created = timestampMs(review.createdAt);
  if (!created) return false;

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startOfTomorrow = startOfToday + 86400000;

  if (filter === "today") return created >= startOfToday && created < startOfTomorrow;
  if (filter === "yesterday") return created >= startOfToday - 86400000 && created < startOfToday;
  if (filter === "7-days") return created >= Date.now() - 7 * 86400000;
  if (filter === "30-days") return created >= Date.now() - 30 * 86400000;

  const from = customFrom ? new Date(`${customFrom}T00:00:00`).getTime() : 0;
  const to = customTo ? new Date(`${customTo}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;
  return created >= from && created <= to;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [starFilter, setStarFilter] = useState<StarFilter>("all");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [page, setPage] = useState(1);
  const [viewingReview, setViewingReview] = useState<AdminReview | null>(null);
  const [replyingReview, setReplyingReview] = useState<AdminReview | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadReviews = useCallback(async (mode: "initial" | "refresh" = "refresh"): Promise<boolean> => {
    try {
      if (mode === "refresh") setRefreshing(true);
      setError("");
      const data = await getAdminReviews();
      setReviews(data);
      return true;
    } catch (loadError) {
      console.error("Failed to load reviews:", loadError);
      setReviews([]);
      setError("Unable to load reviews from Firestore. Check Firestore rules, collection group permissions, and console logs.");
      toast.error("Unable to load reviews.");
      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialReviews() {
      if (!active) return;
      await loadReviews("initial");
    }

    void loadInitialReviews();
    return () => { active = false; };
  }, [loadReviews]);

  const dashboardStats = useMemo(() => {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const images = reviews.filter((review) => review.images.length > 0).length;
    const videos = reviews.filter((review) => review.videos.length > 0).length;

    return [
      { label: "Total Reviews", value: reviews.length.toLocaleString("en-IN"), icon: Star, tone: "bg-[#EAF5E4] text-[#1E5631]" },
      { label: "Pending Reviews", value: reviews.filter((review) => review.status === "pending").length.toLocaleString("en-IN"), icon: CalendarDays, tone: "bg-amber-50 text-amber-700" },
      { label: "Approved Reviews", value: reviews.filter((review) => review.status === "approved").length.toLocaleString("en-IN"), icon: CheckCircle2, tone: "bg-emerald-50 text-emerald-700" },
      { label: "Rejected Reviews", value: reviews.filter((review) => review.status === "rejected").length.toLocaleString("en-IN"), icon: XCircle, tone: "bg-red-50 text-red-700" },
      { label: "Average Rating", value: reviews.length ? (totalRating / reviews.length).toFixed(1) : "0.0", icon: StarHalf, tone: "bg-lime-50 text-lime-700" },
      { label: "5 Star Reviews", value: reviews.filter((review) => review.rating === 5).length.toLocaleString("en-IN"), icon: Star, tone: "bg-yellow-50 text-yellow-700" },
      { label: "4 Star Reviews", value: reviews.filter((review) => review.rating === 4).length.toLocaleString("en-IN"), icon: Star, tone: "bg-orange-50 text-orange-700" },
      { label: "1-2 Star Reviews", value: reviews.filter((review) => review.rating <= 2).length.toLocaleString("en-IN"), icon: ShieldAlert, tone: "bg-rose-50 text-rose-700" },
      { label: "Reviews With Images", value: images.toLocaleString("en-IN"), icon: ImageIcon, tone: "bg-teal-50 text-teal-700" },
      { label: "Reviews With Videos", value: videos.toLocaleString("en-IN"), icon: Film, tone: "bg-sky-50 text-sky-700" },
    ];
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = reviews.filter((review) => {
      const matchesSearch = !keyword || [
        review.customerName,
        review.customerEmail,
        review.productName,
        review.productCategory,
        review.productSlug,
        review.productId,
        review.comment,
        review.title,
        review.id,
        reviewCode(review),
      ].some((value) => value.toLowerCase().includes(keyword));
      const matchesStatus = statusFilter === "all" || review.status === statusFilter;
      const matchesStars = starFilter === "all" || review.rating === Number(starFilter);
      const hasImages = review.images.length > 0;
      const hasVideos = review.videos.length > 0;
      const matchesMedia = mediaFilter === "all"
        || (mediaFilter === "images" && hasImages)
        || (mediaFilter === "videos" && hasVideos)
        || (mediaFilter === "none" && !hasImages && !hasVideos);
      return matchesSearch && matchesStatus && matchesStars && matchesMedia && withinDateFilter(review, dateFilter, customFrom, customTo);
    });

    return filtered.sort((first, second) => {
      if (sort === "oldest") return timestampMs(first.createdAt) - timestampMs(second.createdAt);
      if (sort === "highest-rating") return second.rating - first.rating;
      if (sort === "lowest-rating") return first.rating - second.rating;
      if (sort === "most-helpful") return second.helpfulCount - first.helpfulCount;
      return timestampMs(second.createdAt) - timestampMs(first.createdAt);
    });
  }, [customFrom, customTo, dateFilter, mediaFilter, reviews, search, sort, starFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE));
  const paginatedReviews = filteredReviews.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

  async function handleRefresh() {
    const loaded = await loadReviews("refresh");
    if (loaded) toast.success("Reviews refreshed.");
  }

  async function setReviewStatus(review: AdminReview, status: ReviewStatus) {
    try {
      setBusyId(review.id);
      await updateAdminReview(review.productId, review.id, { status });
      setReviews((current) => current.map((item) => reviewKey(item) === reviewKey(review) ? { ...item, status, updatedAt: new Date().toISOString() } : item));
      if (viewingReview && reviewKey(viewingReview) === reviewKey(review)) setViewingReview((current) => current ? { ...current, status, updatedAt: new Date().toISOString() } : current);
      toast.success(`Review ${status}.`);
    } catch (statusError) {
      console.error(`Failed to update review status for ${review.productId}/${review.id}:`, statusError);
      toast.error("Unable to update review status.");
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    try {
      setBusyId(deleteTarget.id);
      await deleteAdminReview(deleteTarget.productId, deleteTarget.id);
      setReviews((current) => current.filter((item) => reviewKey(item) !== reviewKey(deleteTarget)));
      if (viewingReview && reviewKey(viewingReview) === reviewKey(deleteTarget)) setViewingReview(null);
      toast.success("Review deleted.");
      setDeleteTarget(null);
    } catch (deleteError) {
      console.error(`Failed to delete review ${deleteTarget.productId}/${deleteTarget.id}:`, deleteError);
      toast.error("Unable to delete review.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4F8A3F]">Reviews management</p>
          <h1 className="mt-1 text-3xl font-bold text-[#173522]">Reviews</h1>
          <p className="mt-2 text-sm text-[#607065]">Moderate customer feedback, media, reports, and public admin replies.</p>
        </div>
      </div>

      {loading ? <ReviewsSkeleton /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {dashboardStats.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="rounded-2xl border border-[#1E5631]/10 bg-white p-5 shadow-[0_8px_24px_rgba(23,53,34,0.06)]">
                <div className={`grid size-11 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></div>
                <p className="mt-5 text-2xl font-bold text-[#173522]">{value}</p>
                <p className="mt-1 text-sm font-medium text-[#607065]">{label}</p>
              </div>
            ))}
          </div>

          <ReviewToolbar
            search={search}
            setSearch={(value) => { setSearch(value); setPage(1); }}
            statusFilter={statusFilter}
            setStatusFilter={(value) => { setStatusFilter(value); setPage(1); }}
            starFilter={starFilter}
            setStarFilter={(value) => { setStarFilter(value); setPage(1); }}
            mediaFilter={mediaFilter}
            setMediaFilter={(value) => { setMediaFilter(value); setPage(1); }}
            dateFilter={dateFilter}
            setDateFilter={(value) => { setDateFilter(value); setPage(1); }}
            customFrom={customFrom}
            setCustomFrom={(value) => { setCustomFrom(value); setPage(1); }}
            customTo={customTo}
            setCustomTo={(value) => { setCustomTo(value); setPage(1); }}
            sort={sort}
            setSort={(value) => { setSort(value); setPage(1); }}
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
          />

          {error ? <ErrorState message={error} onRetry={() => void handleRefresh()} /> : reviews.length === 0 ? <EmptyState /> : (
            <ReviewsTable
              reviews={paginatedReviews}
              page={page}
              totalPages={totalPages}
              totalReviews={filteredReviews.length}
              busyId={busyId}
              onPageChange={(nextPage) => setPage(Math.min(Math.max(1, nextPage), totalPages))}
              onView={setViewingReview}
              onStatus={(review, status) => void setReviewStatus(review, status)}
              onReply={setReplyingReview}
              onDelete={setDeleteTarget}
            />
          )}
        </>
      )}

      <ReviewDrawer
        review={viewingReview}
        busyId={busyId}
        onClose={() => setViewingReview(null)}
        onStatus={(review, status) => void setReviewStatus(review, status)}
        onReply={setReplyingReview}
        onDelete={setDeleteTarget}
      />
      {replyingReview ? <ReplyModal key={replyingReview.id} review={replyingReview} onClose={() => setReplyingReview(null)} onSaved={(updatedReview) => {
        setReviews((current) => current.map((item) => reviewKey(item) === reviewKey(updatedReview) ? updatedReview : item));
        if (viewingReview && reviewKey(viewingReview) === reviewKey(updatedReview)) setViewingReview(updatedReview);
        setReplyingReview(null);
      }} /> : null}
      <DeleteDialog review={deleteTarget} busy={busyId === deleteTarget?.id} onClose={() => setDeleteTarget(null)} onConfirm={() => void confirmDelete()} />
    </div>
  );
}

function ReviewToolbar(props: {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
  starFilter: StarFilter;
  setStarFilter: (value: StarFilter) => void;
  mediaFilter: MediaFilter;
  setMediaFilter: (value: MediaFilter) => void;
  dateFilter: DateFilter;
  setDateFilter: (value: DateFilter) => void;
  customFrom: string;
  setCustomFrom: (value: string) => void;
  customTo: string;
  setCustomTo: (value: string) => void;
  sort: ReviewSort;
  setSort: (value: ReviewSort) => void;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-[#1E5631]/10 bg-white p-4 shadow-[0_8px_24px_rgba(23,53,34,0.05)]">
      <div className="grid gap-3 xl:grid-cols-[1fr_170px_150px_150px_170px_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#607065]" />
          <input value={props.search} onChange={(event) => props.setSearch(event.target.value)} placeholder="Search customer, email, product, review text, review ID" className="h-12 w-full rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] pl-11 pr-4 text-sm font-medium text-[#173522] outline-none transition focus:border-[#1E5631]" />
        </label>
        <Select value={props.statusFilter} onChange={(value) => props.setStatusFilter(value as StatusFilter)} options={[["all", "All Status"], ["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"], ["reported", "Reported"], ["hidden", "Hidden"]]} />
        <Select value={props.starFilter} onChange={(value) => props.setStarFilter(value as StarFilter)} options={[["all", "All Stars"], ["5", "5 Stars"], ["4", "4 Stars"], ["3", "3 Stars"], ["2", "2 Stars"], ["1", "1 Star"]]} />
        <Select value={props.mediaFilter} onChange={(value) => props.setMediaFilter(value as MediaFilter)} options={[["all", "All Media"], ["images", "Images"], ["videos", "Videos"], ["none", "No Media"]]} />
        <Select value={props.dateFilter} onChange={(value) => props.setDateFilter(value as DateFilter)} options={[["all", "All Dates"], ["today", "Today"], ["yesterday", "Yesterday"], ["7-days", "Last 7 Days"], ["30-days", "Last 30 Days"], ["custom", "Custom"]]} />
        <button onClick={props.onRefresh} disabled={props.refreshing} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1E5631] px-5 text-sm font-bold text-white transition hover:bg-[#164427] disabled:cursor-not-allowed disabled:opacity-70">
          <RefreshCw className={`size-4 ${props.refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Select value={props.sort} onChange={(value) => props.setSort(value as ReviewSort)} options={[["newest", "Newest"], ["oldest", "Oldest"], ["highest-rating", "Highest Rating"], ["lowest-rating", "Lowest Rating"], ["most-helpful", "Most Helpful"]]} />
        {props.dateFilter === "custom" ? (
          <>
            <input type="date" value={props.customFrom} onChange={(event) => props.setCustomFrom(event.target.value)} className="h-12 rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] px-4 text-sm font-bold text-[#173522] outline-none focus:border-[#1E5631]" />
            <input type="date" value={props.customTo} onChange={(event) => props.setCustomTo(event.target.value)} className="h-12 rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] px-4 text-sm font-bold text-[#173522] outline-none focus:border-[#1E5631]" />
          </>
        ) : null}
      </div>
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: [string, string][] }) {
  return <select value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] px-4 text-sm font-bold text-[#173522] outline-none focus:border-[#1E5631]">{options.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}</select>;
}

function ReviewsTable({ reviews, page, totalPages, totalReviews, busyId, onPageChange, onView, onStatus, onReply, onDelete }: {
  reviews: AdminReview[];
  page: number;
  totalPages: number;
  totalReviews: number;
  busyId: string | null;
  onPageChange: (page: number) => void;
  onView: (review: AdminReview) => void;
  onStatus: (review: AdminReview, status: ReviewStatus) => void;
  onReply: (review: AdminReview) => void;
  onDelete: (review: AdminReview) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#1E5631]/10 bg-white shadow-[0_8px_24px_rgba(23,53,34,0.05)]">
      <div className="overflow-x-auto">
        <table className="min-w-[1320px] w-full text-left">
          <thead className="bg-[#F3F7F1] text-xs font-bold uppercase tracking-[0.12em] text-[#607065]">
            <tr>
              {["Review ID", "Customer", "Product", "Product Image", "Stars", "Review", "Images Count", "Videos Count", "Helpful Votes", "Report Count", "Status", "Created Date", "Actions"].map((heading) => <th key={heading} className="px-4 py-4">{heading}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E5631]/10">
            {reviews.map((review) => (
              <tr key={reviewKey(review)} className="align-top transition hover:bg-[#FBFCF8]">
                <td className="px-4 py-4 text-sm font-bold text-[#173522]">{reviewCode(review)}</td>
                <td className="px-4 py-4"><p className="font-bold text-[#173522]">{review.customerName}</p><p className="mt-1 text-xs text-[#607065]">{review.customerEmail || "No email"}</p></td>
                <td className="px-4 py-4 text-sm"><p className="font-semibold text-[#173522]">{review.productName}</p><p className="mt-1 text-xs text-[#607065]">{review.productCategory || "Uncategorized"} · {formatCurrency(review.productPrice)}</p><p className="mt-1 text-xs text-[#607065]">{review.productSlug}</p></td>
                <td className="px-4 py-4"><MediaImage src={review.productImage} alt="" size="sm" /></td>
                <td className="px-4 py-4"><Stars rating={review.rating} /></td>
                <td className="px-4 py-4"><p className="line-clamp-2 max-w-xs text-sm leading-6 text-[#607065]">{review.title ? `${review.title} - ` : ""}{review.comment || "No review text."}</p></td>
                <td className="px-4 py-4 text-sm text-[#607065]">{review.images.length}</td>
                <td className="px-4 py-4 text-sm text-[#607065]">{review.videos.length}</td>
                <td className="px-4 py-4 text-sm font-bold text-[#173522]">{review.helpfulCount}</td>
                <td className="px-4 py-4 text-sm font-bold text-[#173522]">{review.reportCount}</td>
                <td className="px-4 py-4"><StatusBadge status={review.status} /></td>
                <td className="px-4 py-4 text-sm text-[#607065]">{formatDate(review.createdAt)}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <IconButton label="View review" icon={Eye} onClick={() => onView(review)} />
                    <IconButton label="Approve review" icon={CheckCircle2} onClick={() => onStatus(review, "approved")} disabled={busyId === review.id} />
                    <IconButton label="Reject review" icon={XCircle} onClick={() => onStatus(review, "rejected")} disabled={busyId === review.id} />
                    <IconButton label="Hide review" icon={Ban} onClick={() => onStatus(review, "hidden")} disabled={busyId === review.id} />
                    <IconButton label="Reply to review" icon={MessageSquareReply} onClick={() => onReply(review)} />
                    <IconButton label="Delete review" icon={Trash2} onClick={() => onDelete(review)} danger />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-[#1E5631]/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[#607065]">Showing {reviews.length} of {totalReviews} reviews</p>
        <div className="flex items-center gap-2">
          <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="grid size-10 place-items-center rounded-xl border border-[#1E5631]/10 text-[#173522] hover:bg-[#EAF5E4] disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="size-4" /></button>
          <span className="min-w-24 text-center text-sm font-bold text-[#173522]">Page {page} of {totalPages}</span>
          <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="grid size-10 place-items-center rounded-xl border border-[#1E5631]/10 text-[#173522] hover:bg-[#EAF5E4] disabled:opacity-40" aria-label="Next page"><ChevronRight className="size-4" /></button>
        </div>
      </div>
    </div>
  );
}

function ReviewDrawer({ review, busyId, onClose, onStatus, onReply, onDelete }: {
  review: AdminReview | null;
  busyId: string | null;
  onClose: () => void;
  onStatus: (review: AdminReview, status: ReviewStatus) => void;
  onReply: (review: AdminReview) => void;
  onDelete: (review: AdminReview) => void;
}) {
  if (!review) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-[#173522]/45 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="view-review-title">
      <div className="ml-auto flex h-full w-full max-w-5xl flex-col overflow-hidden bg-[#F7FAF4] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#1E5631]/10 bg-white p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4F8A3F]">Review details</p>
            <h2 id="view-review-title" className="mt-1 text-2xl font-bold text-[#173522]">{review.productName}</h2>
            <p className="mt-1 text-sm text-[#607065]">{reviewCode(review)} · {formatDate(review.createdAt, true)}</p>
          </div>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-xl text-[#607065] hover:bg-[#EAF5E4] hover:text-[#1E5631]" aria-label="Close review details"><X className="size-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <Panel title="Customer" icon={ShieldAlert}>
              <div className="mb-5 flex items-center gap-4">
                {review.customerPhoto ? <MediaImage src={review.customerPhoto} alt="" size="md" /> : <div className="grid size-14 place-items-center rounded-xl bg-[#EAF5E4] text-sm font-black text-[#1E5631]">{initials(review.customerName)}</div>}
                <div>
                  <p className="font-bold text-[#173522]">{review.customerName}</p>
                  <p className="text-sm text-[#607065]">{review.customerEmail || "No email"}</p>
                  <p className="text-sm text-[#607065]">{review.customerPhone || "No phone"}</p>
                </div>
              </div>
              <InfoGrid items={[["Order ID", review.orderId || "—"], ["Review ID", reviewCode(review)], ["Helpful Count", String(review.helpfulCount)], ["Report Count", String(review.reportCount)]]} />
            </Panel>
            <Panel title="Product" icon={ImageIcon}>
              <div className="flex items-center gap-4">
                <MediaImage src={review.productImage} alt="" size="lg" />
                <div>
                  <p className="font-bold text-[#173522]">{review.productName}</p>
                  <p className="mt-2 text-sm text-[#607065]">Product ID: {review.productId}</p>
                  <p className="text-sm text-[#607065]">Slug: {review.productSlug}</p>
                  <p className="text-sm text-[#607065]">Category: {review.productCategory || "Uncategorized"}</p>
                  <p className="text-sm text-[#607065]">Price: {formatCurrency(review.productPrice)}</p>
                  <div className="mt-3"><Stars rating={review.rating} /></div>
                </div>
              </div>
            </Panel>
            <Panel title="Review" icon={Star}>
              <InfoGrid items={[["Rating", `${review.rating} / 5`], ["Title", review.title || "—"], ["Status", review.status], ["Verified Purchase", review.verifiedPurchase ? "Yes" : "No"], ["Created Date", formatDate(review.createdAt, true)], ["Updated Date", formatDate(review.updatedAt, true)]]} />
              <p className="mt-5 whitespace-pre-line text-sm leading-6 text-[#607065]">{review.comment || "No review text."}</p>
            </Panel>
            <Panel title="Admin Reply" icon={MessageSquareReply}>
              {review.adminReply ? (
                <div>
                  <p className="text-sm leading-6 text-[#607065]">{review.adminReply.text}</p>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-[#607065]">{review.adminReply.adminName} · {formatDate(review.adminReply.updatedAt ?? review.adminReply.createdAt, true)}</p>
                </div>
              ) : <p className="text-sm text-[#607065]">No admin reply yet.</p>}
            </Panel>
            <Panel title="Uploaded Images" icon={ImageIcon}>
              {review.images.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{review.images.map((image) => <MediaImage key={image} src={image} alt="" size="tile" />)}</div> : <p className="text-sm text-[#607065]">No images uploaded.</p>}
            </Panel>
            <Panel title="Uploaded Videos" icon={Film}>
              {review.videos.length ? <div className="space-y-3">{review.videos.map((video) => <video key={video} controls className="w-full rounded-xl border border-[#1E5631]/10"><source src={video} /></video>)}</div> : <p className="text-sm text-[#607065]">No videos uploaded.</p>}
            </Panel>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-[#1E5631]/10 bg-white p-5">
          <button onClick={() => onStatus(review, "approved")} disabled={busyId === review.id} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"><CheckCircle2 className="size-4" />Approve</button>
          <button onClick={() => onStatus(review, "rejected")} disabled={busyId === review.id} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700"><XCircle className="size-4" />Reject</button>
          <button onClick={() => onStatus(review, "hidden")} disabled={busyId === review.id} className="inline-flex items-center gap-2 rounded-xl bg-[#173522] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#102619]"><Ban className="size-4" />Hide</button>
          <button onClick={() => onReply(review)} className="inline-flex items-center gap-2 rounded-xl border border-[#1E5631]/10 px-5 py-2.5 text-sm font-bold text-[#1E5631] hover:bg-[#EAF5E4]"><MessageSquareReply className="size-4" />Reply</button>
          <button onClick={() => onDelete(review)} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100"><Trash2 className="size-4" />Delete</button>
        </div>
      </div>
    </div>
  );
}

function ReplyModal({ review, onClose, onSaved }: { review: AdminReview; onClose: () => void; onSaved: (review: AdminReview) => void }) {
  const [reply, setReply] = useState(review.adminReply?.text ?? "");
  const [adminName, setAdminName] = useState(review.adminReply?.adminName ?? "Admin");
  const [saving, setSaving] = useState(false);

  async function saveReply() {
    if (!reply.trim()) {
      toast.error("Reply cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      const adminReply = { text: reply.trim(), adminName: adminName.trim() || "Admin", createdAt: review.adminReply?.createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() };
      await updateAdminReview(review.productId, review.id, { adminReply });
      onSaved({ ...review, adminReply, updatedAt: new Date().toISOString() });
      toast.success("Admin reply saved.");
    } catch (replyError) {
      console.error(`Failed to save admin reply for ${review.productId}/${review.id}:`, replyError);
      toast.error("Unable to save reply.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteReply() {
    try {
      setSaving(true);
      await updateAdminReview(review.productId, review.id, { adminReply: null });
      const withoutReply: AdminReview = { ...review };
      delete withoutReply.adminReply;
      onSaved({ ...withoutReply, updatedAt: new Date().toISOString() });
      toast.success("Admin reply deleted.");
    } catch (replyError) {
      console.error(`Failed to delete admin reply for ${review.productId}/${review.id}:`, replyError);
      toast.error("Unable to delete reply.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#173522]/45 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="reply-title">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#1E5631]/10 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4F8A3F]">Admin reply</p>
            <h2 id="reply-title" className="mt-1 text-xl font-bold text-[#173522]">{reviewCode(review)}</h2>
            <p className="mt-1 text-sm text-[#607065]">This reply is saved on the review document for customer-site display.</p>
          </div>
          <button onClick={onClose} disabled={saving} className="grid size-10 place-items-center rounded-xl text-[#607065] hover:bg-[#EAF5E4] hover:text-[#1E5631]" aria-label="Close reply dialog"><X className="size-5" /></button>
        </div>
        <div className="space-y-4 p-5">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#607065]">Admin Name</span>
            <input value={adminName} onChange={(event) => setAdminName(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] px-4 text-sm font-medium text-[#173522] outline-none focus:border-[#1E5631]" />
          </label>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#607065]">Reply</span>
            <textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={6} className="mt-2 w-full rounded-xl border border-[#1E5631]/10 bg-[#F7FAF4] px-4 py-3 text-sm font-medium text-[#173522] outline-none focus:border-[#1E5631]" />
          </label>
        </div>
        <div className="flex flex-wrap justify-end gap-3 border-t border-[#1E5631]/10 p-5">
          {review.adminReply ? <button onClick={() => void deleteReply()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100"><Trash2 className="size-4" />Delete Reply</button> : null}
          <button onClick={onClose} disabled={saving} className="rounded-xl px-5 py-2.5 text-sm font-bold text-[#607065] hover:bg-[#F3F7F1]">Cancel</button>
          <button onClick={() => void saveReply()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-[#1E5631] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#164427] disabled:cursor-not-allowed disabled:opacity-65">{saving ? <RefreshCw className="size-4 animate-spin" /> : <MessageSquareReply className="size-4" />}{saving ? "Saving" : "Save Reply"}</button>
        </div>
      </div>
    </div>
  );
}

function MediaImage({ src, alt, size }: { src: string; alt: string; size: "sm" | "md" | "lg" | "tile" }) {
  const classes = size === "tile" ? "relative aspect-square w-full overflow-hidden rounded-xl border border-[#1E5631]/10" : size === "lg" ? "relative size-24 shrink-0 overflow-hidden rounded-xl border border-[#1E5631]/10" : size === "md" ? "relative size-14 shrink-0 overflow-hidden rounded-xl border border-[#1E5631]/10" : "relative size-12 shrink-0 overflow-hidden rounded-xl border border-[#1E5631]/10";

  return (
    <div className={classes}>
      <Image src={safeImageSrc(src || "/images/product-placeholder.png")} alt={alt} fill unoptimized className="object-cover" />
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`size-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-[#D3D9CF]"}`} />)}<span className="ml-1 text-sm font-bold text-[#173522]">{rating}</span></div>;
}

function IconButton({ label, icon: Icon, onClick, disabled, danger }: { label: string; icon: LucideIcon; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} title={label} aria-label={label} className={`grid size-9 place-items-center rounded-xl border transition disabled:cursor-not-allowed disabled:opacity-45 ${danger ? "border-red-100 bg-red-50 text-red-600 hover:bg-red-100" : "border-[#1E5631]/10 bg-white text-[#1E5631] hover:bg-[#EAF5E4]"}`}><Icon className="size-4" /></button>;
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const tone = status === "approved" ? "bg-emerald-50 text-emerald-700" : status === "rejected" ? "bg-red-50 text-red-700" : status === "hidden" ? "bg-stone-100 text-stone-700" : status === "reported" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700";
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${tone}`}>{status}</span>;
}

function Panel({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return <section className="rounded-2xl border border-[#1E5631]/10 bg-white p-5 shadow-[0_8px_24px_rgba(23,53,34,0.04)]"><div className="mb-5 flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#EAF5E4] text-[#1E5631]"><Icon className="size-5" /></div><h3 className="text-lg font-bold text-[#173522]">{title}</h3></div>{children}</section>;
}

function InfoGrid({ items }: { items: [string, string][] }) {
  return <dl className="grid gap-4 sm:grid-cols-2">{items.map(([label, value]) => <div key={label}><dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#607065]">{label}</dt><dd className="mt-1 text-sm font-semibold text-[#173522]">{value}</dd></div>)}</dl>;
}

function ReviewsSkeleton() {
  return <div className="space-y-6" aria-label="Loading reviews"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 10 }, (_, index) => <div key={index} className="h-36 animate-pulse rounded-2xl border border-[#1E5631]/10 bg-[#F3F7F1]" />)}</div><div className="h-32 animate-pulse rounded-2xl border border-[#1E5631]/10 bg-[#F3F7F1]" /><div className="h-[480px] animate-pulse rounded-2xl border border-[#1E5631]/10 bg-[#F3F7F1]" /></div>;
}

function EmptyState() {
  return <div className="rounded-2xl border border-dashed border-[#1E5631]/20 bg-white px-6 py-16 text-center shadow-sm"><div className="mx-auto grid size-20 place-items-center rounded-2xl bg-[#EAF5E4] text-[#1E5631]"><Star className="size-10" /></div><h2 className="mt-6 text-2xl font-bold text-[#173522]">No Reviews Yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#607065]">Customer reviews will appear here after shoppers submit product feedback.</p></div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600"><XCircle className="size-7" /></div><h2 className="mt-5 text-xl font-bold text-[#173522]">Reviews could not load</h2><p className="mt-2 text-sm text-[#607065]">{message}</p><button onClick={onRetry} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1E5631] px-5 py-3 text-sm font-bold text-white hover:bg-[#164427]"><RefreshCw className="size-4" />Try Again</button></div>;
}

function DeleteDialog({ review, busy, onClose, onConfirm }: { review: AdminReview | null; busy: boolean; onClose: () => void; onConfirm: () => void }) {
  if (!review) return null;

  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#173522]/45 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-review-title"><div className="w-full max-w-md rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-[#1E5631]/10 p-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">Confirm delete</p><h2 id="delete-review-title" className="mt-1 text-xl font-bold text-[#173522]">Delete review?</h2></div><button onClick={onClose} disabled={busy} className="grid size-10 place-items-center rounded-xl text-[#607065] hover:bg-[#EAF5E4] hover:text-[#1E5631]" aria-label="Close delete dialog"><X className="size-5" /></button></div><div className="p-5"><p className="text-sm leading-6 text-[#607065]">This will permanently remove <span className="font-bold text-[#173522]">{reviewCode(review)}</span> from {review.productName}. Uploaded media files are not deleted from Storage.</p></div><div className="flex justify-end gap-3 border-t border-[#1E5631]/10 p-5"><button onClick={onClose} disabled={busy} className="rounded-xl px-5 py-2.5 text-sm font-bold text-[#607065] hover:bg-[#F3F7F1]">Cancel</button><button onClick={onConfirm} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-65">{busy ? <RefreshCw className="size-4 animate-spin" /> : <Trash2 className="size-4" />}{busy ? "Deleting" : "Delete"}</button></div></div></div>;
}
