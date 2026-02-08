import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import YouTube from "react-youtube";
import {
  PlayCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Layers,
  ListVideo,
  MonitorPlay,
  AlertCircle,
  Sparkles,
  Rocket,
  ChevronRight,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserAvatar from "../../components/UserAvatar.jsx";
import { useAuthStore } from "../../store/authstore.js";

const youtubeaxios = axios.create({
  withCredentials: false,
});

/* ======================================================
   CONFIG
====================================================== */
const BASE_URL = "http://localhost:8000/api";
const USER_API = "http://localhost:5000/api";
const YOUTUBE_API_KEY = "AIzaSyBs569PnYQUNFUXon5AMersGFuKS8aS1QQ";

/* ======================================================
   UI COMPONENTS (Modern Design)
====================================================== */

// Updated Channel Card with Local Storage Notes Management
const ChannelCard = ({ name, imageUrl, selectedVideoId, channelId, courseId }) => {
  const [notesLink, setNotesLink] = useState('');
  const [savedNotesLink, setSavedNotesLink] = useState('');
  const [showInput, setShowInput] = useState(false);

  // Load saved notes link from localStorage
  useEffect(() => {
    if (!selectedVideoId) return;

    const storageKey = `video-notes-${selectedVideoId}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      setSavedNotesLink(saved);
    } else {
      setSavedNotesLink('');
    }
  }, [selectedVideoId]);

  const openNewGoogleDoc = () => {
    window.open('https://docs.google.com/document/create', '_blank');
  };

  const openSavedNotes = () => {
    if (savedNotesLink) {
      window.open(savedNotesLink, '_blank');
    }
  };

  const handleSaveNotesLink = () => {
    if (!notesLink.trim() || !selectedVideoId) return;

    // Basic validation for Google Docs URL
    if (!notesLink.includes('docs.google.com')) {
      alert('Please enter a valid Google Docs link');
      return;
    }

    const storageKey = `video-notes-${selectedVideoId}`;
    localStorage.setItem(storageKey, notesLink.trim());

    setSavedNotesLink(notesLink.trim());
    setNotesLink('');
    setShowInput(false);
  };

  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-6 mb-6 shadow-sm border border-white/50 transition-all hover:shadow-md">
      <div className="flex items-center space-x-5 mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden shadow-md ring-4 ring-white flex-shrink-0 bg-gray-100">
          <img
            src={imageUrl || "/fallback.jpg"}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "https://placehold.co/100x100?text=CH"; }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xl font-black text-gray-900 line-clamp-1">{name || "Channel Name"}</div>
          <div className="mt-1 text-sm font-bold text-indigo-600 cursor-pointer hover:underline flex items-center gap-3">
            <div
              onClick={openNewGoogleDoc}
              className="flex items-center gap-1"
            >
              <Layers className="w-3 h-3" /> Create New Notes
            </div>
            <div
              onClick={() => window.location.href = '/dashboard/learning-map'}
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
            >
              <Rocket className="w-3 h-3" /> Projects
            </div>
          </div>
        </div>
      </div>

      {/* Saved Notes Link */}
      {savedNotesLink && (
        <div className="mb-3 p-3 bg-green-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Saved Notes</span>
            <button
              onClick={openSavedNotes}
              className="text-xs font-bold text-green-600 hover:text-green-800 underline flex items-center gap-1 cursor-pointer"
            >
              Open Notes <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Add/Update Notes Link */}
      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="w-full py-2 px-4 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Layers className="w-4 h-4" />
          {savedNotesLink ? 'Update Notes Link' : 'Save Notes Link'}
        </button>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={notesLink}
            onChange={(e) => setNotesLink(e.target.value)}
            placeholder="Paste your Google Docs link here..."
            className="w-full px-4 py-2 border-2 border-indigo-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 transition-colors"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveNotesLink}
              disabled={!notesLink.trim()}
              className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowInput(false);
                setNotesLink('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Updated Playlist Item with Progress
const PlayListItem = ({ video, index, duration, onVideoSelect, isPlaying, videoProgress }) => {
  const title = video?.snippet?.title || "No Title";
  const thumbnail = video?.snippet?.thumbnails?.medium?.url;
  const videoId =
    video?.snippet?.resourceId?.videoId ||
    video?.id ||
    null;

  const progress = videoProgress[videoId] || 0;
  const totalSeconds = duration || 0;

  const isCompleted = totalSeconds > 0 && progress >= totalSeconds * 0.9;
  const showResume = progress > 5 && !isCompleted;

  const formatSeconds = (seconds) => {
    if (!seconds) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onVideoSelect(video)}
      className={`group cursor-pointer rounded-2xl p-3 flex items-start gap-4 transition-all duration-300 border ${isPlaying
        ? "bg-[#1A1A1A] text-white shadow-xl border-[#1A1A1A]"
        : "bg-white text-gray-800 hover:bg-gray-50 hover:shadow-sm border-gray-100"
        }`}
    >
      <div className="relative w-28 h-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-200 shadow-inner">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800"><MonitorPlay className="text-gray-500" /></div>
        )}

        {/* Progress Bar */}
        {progress > 0 && totalSeconds > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600/50">
            <div
              className="h-full bg-indigo-500"
              style={{
                width: `${Math.min((progress / totalSeconds) * 100, 100)}%`,
              }}
            />
          </div>
        )}

        {/* Play Overlay */}
        {isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
              <div className="w-2 h-2 bg-[#D4F478] rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between h-20 py-0.5 w-full min-w-0">
        <div className={`text-sm font-bold leading-tight line-clamp-2 ${isPlaying ? 'text-gray-100' : 'text-gray-900'}`}>
          <span className={`mr-2 text-xs font-mono opacity-60 ${isPlaying ? 'text-gray-400' : 'text-gray-500'}`}>
            {(index + 1).toString().padStart(2, '0')}
          </span>
          {title}
        </div>
        <div className={`text-xs mt-auto flex items-center justify-between font-medium ${isPlaying ? 'text-gray-400' : 'text-gray-500'}`}>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatSeconds(totalSeconds) || "N/A"}
          </span>
          {isPlaying && <span className="text-[#1A1A1A] bg-[#D4F478] font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">Playing</span>}
          {!isPlaying && isCompleted && <span className="text-emerald-700 bg-emerald-50 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">Completed</span>}
          {!isPlaying && showResume && <span className="text-amber-600 bg-amber-50 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">Resume at {Math.floor(progress / 60)}:
            {String(Math.floor(progress % 60)).padStart(2, "0")}</span>}
        </div>
      </div>
    </motion.div>
  );
};

// Player Component
const PlayListPlayer = ({ video, onPlayerReady, onStateChange, onWatchLater, isSaved, isSaving }) => {
  const videoId =
    video?.snippet?.resourceId?.videoId ||
    video?.id ||
    null;

  const title = video?.snippet?.title || "";

  useEffect(() => {
    const disableContextMenu = (e) => e.preventDefault();
    const disableSelect = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableContextMenu);
    document.addEventListener("selectstart", disableSelect);
    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
      document.removeEventListener("selectstart", disableSelect);
    };
  }, []);

  if (!videoId) {
    return (
      <div className="w-full lg:w-[68%] bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-xl p-8 flex flex-col items-center justify-center min-h-[400px] md:min-h-[500px] text-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg animate-pulse ring-8 ring-white/30">
          <PlayCircle className="w-12 h-12 text-indigo-400" />
        </div>
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Ready to start?</h3>
        <p className="text-gray-500 mt-2 font-medium">Select a lesson from the playlist to begin watching.</p>
      </div>
    );
  }

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: { autoplay: 0, controls: 1, modestbranding: 1, rel: 0 },
  };

  return (
    <div className="w-full lg:w-[68%] flex flex-col gap-6">
      {/* Video Container */}
      <div className="relative w-full aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-white ring-1 ring-gray-200 group z-10 transition-transform duration-500">
        <div className="absolute inset-0">
          <YouTube
            key={`${videoId}-${video?.id || "playlist"}`}
            videoId={videoId}
            opts={opts}
            onReady={onPlayerReady}
            onStateChange={onStateChange}
            className="w-full h-full"
            iframeClassName="w-full h-full"
          />
        </div>
      </div>

      {/* Video Meta */}
      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        {/* Decorative blob inside card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight flex-1 line-clamp-2 relative z-10">{title}</h2>
        <div className="flex gap-2 relative z-10">
          <button
            onClick={onWatchLater}
            disabled={isSaved || isSaving}
            className={`px-6 py-3.5 rounded-full font-bold text-sm shadow-lg transition-all hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-2 group active:scale-95 cursor-pointer
                ${isSaved
                ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 cursor-default"
                : "bg-[#1A1A1A] hover:bg-black text-white"
              }`}
          >
            {isSaved ? (
              <>
                <CheckCircle className="w-4 h-4" /> Saved
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 group-hover:text-[#D4F478] transition-colors" /> Watch Later
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
const PlayListSidebar = ({ videos, durations, onVideoSelect, selectedVideoId, channelData, videoProgress, channelId, courseId }) => {
  return (
    <div className="w-full lg:w-[32%] flex flex-col h-full mt-8 lg:mt-0">
      <ChannelCard
        name={channelData?.name}
        imageUrl={channelData?.imageUrl}
        selectedVideoId={selectedVideoId}
        channelId={channelId}
        courseId={courseId}
      />

      <div className="bg-white/50 backdrop-blur-xl border border-white rounded-[2.5rem] p-5 shadow-lg flex-1 flex flex-col min-h-[400px] max-h-[600px] lg:max-h-[calc(100vh-120px)] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-50/50 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-6 px-2 pt-2 relative z-10">
          <div className="w-12 h-12 bg-[#1A1A1A] rounded-2xl flex items-center justify-center text-[#D4F478] shadow-md transform -rotate-3 transition-transform hover:rotate-0">
            <ListVideo className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Course Content</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{videos.length} Lessons</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar relative z-10">
          {videos.map((video, index) => {
            const videoId =
              video?.snippet?.resourceId?.videoId ||
              video?.id ||
              `item-${index}`;

            const key = videoId || video?.id || index;
            return (
              <PlayListItem
                key={key}
                index={index}
                video={video}
                duration={durations[videoId]}
                onVideoSelect={onVideoSelect}
                isPlaying={selectedVideoId === videoId}
                videoProgress={videoProgress}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Quiz Modal (Redesigned)
const QuizModal = ({ quiz, onAnswer, onClose }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleButtonClick = (option) => {
    setSelectedAnswer(option);
    onAnswer(option);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-[#1A1A1A]/90 backdrop-blur-sm z-[200]">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4F478]/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200/30 rounded-full blur-[80px] pointer-events-none" />

        {/* Close button - Only visible after answering */}
        {selectedAnswer && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors z-[10]"
          >
            <XCircle className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <div className="relative z-10">
          {/* Icon Header */}
          <div className="w-16 h-16 rounded-2xl bg-[#D4F478] flex items-center justify-center mb-6 shadow-lg shadow-[#D4F478]/20">
            <Sparkles className="w-8 h-8 text-[#1A1A1A]" />
          </div>

          <div className="mb-8">
            <motion.span
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="inline-block px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-3"
            >
              Knowledge Check
            </motion.span>
            <h2 className="text-3xl font-black text-[#1A1A1A] leading-tight tracking-tight">Test Your Knowledge</h2>
          </div>

          <div className="mb-8 bg-gray-50/50 p-6 rounded-3xl border border-gray-100 backdrop-blur-sm">
            <p className="text-[#1A1A1A] text-lg font-bold leading-relaxed">
              {quiz.question}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {quiz.options.map((option, i) => {
              let styleClass = "bg-white border-2 border-gray-100 text-gray-700 hover:border-[#D4F478] hover:bg-[#D4F478]/5";
              let icon = <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#D4F478]" />;

              if (selectedAnswer) {
                if (option === quiz.correctAnswer) {
                  styleClass = "bg-[#D4F478] border-[#D4F478] text-[#1A1A1A] shadow-lg shadow-[#D4F478]/20";
                  icon = <CheckCircle className="w-5 h-5 text-[#1A1A1A]" />;
                } else if (option === selectedAnswer && option !== quiz.correctAnswer) {
                  styleClass = "bg-rose-50 border-rose-500 text-rose-800 shadow-sm";
                  icon = <XCircle className="w-5 h-5 text-rose-600" />;
                } else {
                  styleClass = "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed opacity-50";
                  icon = null;
                }
              }

              return (
                <button
                  key={i}
                  className={`group w-full py-4 px-6 rounded-2xl font-bold text-left transition-all duration-200 flex items-center justify-between active:scale-[0.98] ${styleClass}`}
                  onClick={() => handleButtonClick(option)}
                  disabled={!!selectedAnswer}
                >
                  <span className="text-base">{option}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          {selectedAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-8 p-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-sm ${selectedAnswer === quiz.correctAnswer
                ? 'bg-[#D4F478]/20 text-[#1A1A1A] border border-[#D4F478]/30'
                : 'bg-rose-100 text-rose-800 border border-rose-200'}`}
            >
              {selectedAnswer === quiz.correctAnswer ? (
                <>
                  <Sparkles className="w-4 h-4 text-[#1A1A1A] animate-pulse" />
                  Great job! Resuming lesson...
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  Incorrect. Correct: <span className="underline decoration-2 ml-1">{quiz.correctAnswer}</span>
                </>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* ======================================================
   MAIN COMPONENT
====================================================== */
export default function VideoPlayer() {
  const { channelId, courseId } = useParams();
  const [searchParams] = useSearchParams();
  const targetVideoId = searchParams.get("video");
  const navigate = useNavigate();

  const { user, logout, isAuthenticated } = useAuthStore();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDashboardClick = () => {
    navigate("/dashboard");
    setIsProfileDropdownOpen(false);
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Playlist & Video State
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [durations, setDurations] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [channelInfo, setChannelInfo] = useState(null);

  // Watch Later State
  const [savedVideoIds, setSavedVideoIds] = useState(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Video Progress State
  const [videoProgress, setVideoProgress] = useState({});
  const lastSavedRef = useRef(0);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizQueue, setQuizQueue] = useState([]);
  const [player, setPlayer] = useState(null);
  const [shownQuizzes, setShownQuizzes] = useState(new Set());

  /* ======================================================
     HELPER FUNCTIONS
  ====================================================== */
  const formatDuration = (iso) => {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const h = parseInt(match?.[1] || 0);
    const m = parseInt(match?.[2] || 0);
    const s = parseInt(match?.[3] || 0);
    const hh = h > 0 ? `${h}:` : "";
    const mm = m < 10 && h > 0 ? `0${m}` : `${m}`;
    const ss = s < 10 ? `0${s}` : `${s}`;
    return `${hh}${mm}:${ss}`;
  };

  const durationToSeconds = (d) => {
    if (!d) return 0;
    const parts = d.split(":").map(Number);
    if (parts.length === 3)
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
  };

  const updateCourseTotal = async (totalSeconds) => {
    if (!courseId || !channelId || totalSeconds <= 0) return;

    try {
      await axios.post(
        `${USER_API}/users/update-course-total`,
        {
          courseId,
          channelId,
          totalSeconds,
        },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("❌ Failed to update course total", err.response?.data);
    }
  };

  /* ======================================================
     PROGRESS TRACKING
  ====================================================== */
  const saveProgress = async (seconds) => {
    if (!selectedVideoId) return;

    const duration = durations[selectedVideoId];
    if (!duration || duration <= 0) return;

    try {
      await axios.post(
        `${USER_API}/users/video-progress`,
        {
          videoId: selectedVideoId,
          courseId,
          channelId,
          watchedSeconds: seconds,
          durationSeconds: duration,
        },
        { withCredentials: true }
      );

      setVideoProgress((prev) => ({
        ...prev,
        [selectedVideoId]: seconds,
      }));
    } catch (err) {
      console.error("Progress save failed", err);
    }
  };

  const handleTimeUpdate = (currentTime) => {
    if (!selectedVideoId) return;

    setVideoProgress((prev) => ({
      ...prev,
      [selectedVideoId]: currentTime,
    }));

    if (currentTime - lastSavedRef.current >= 10) {
      lastSavedRef.current = currentTime;
      saveProgress(currentTime);
    }

    if (!quizQuestions || quizQuestions.length === 0) return;

    const dueQuizzes = quizQuestions.filter((q) => {
      if (q.videoId !== selectedVideoId) return false;
      const quizTime = Math.floor(q.timestamp);
      const timeDiff = Math.abs(quizTime - currentTime);
      return timeDiff <= 1 && !shownQuizzes.has(q._id);
    });

    if (dueQuizzes.length > 0) {
      setQuizQueue((prev) => [...prev, ...dueQuizzes]);
      setShownQuizzes((prev) => {
        const newSet = new Set(prev);
        dueQuizzes.forEach((q) => newSet.add(q._id));
        return newSet;
      });
    }
  };

  /* ======================================================
     PLAYER HANDLERS
  ====================================================== */
  const handlePlayerReady = (event) => {
    const playerInstance = event.target;
    setPlayer(playerInstance);

    // ✅ Make sure selectedVideoId is set before this runs
    const savedTime = videoProgress[selectedVideoId];

    try {
      if (savedTime && savedTime > 5) {
        playerInstance.seekTo(savedTime, true);
      }
      playerInstance.playVideo(); // 🔥 REQUIRED FOR SINGLE VIDEO
    } catch (err) {
      console.error("Error in handlePlayerReady:", err);
    }
  };


  const handleStateChange = (event) => {
    const playerInstance = event.target;
    const state = event.data;

    // PLAYING
    if (state === 1) {
      if (playerInstance.interval) {
        clearInterval(playerInstance.interval);
      }

      playerInstance.interval = setInterval(() => {
        try {
          const currentTime = Math.floor(playerInstance.getCurrentTime());
          handleTimeUpdate(currentTime);
        } catch { }
      }, 1000);
    }
    // PAUSED / ENDED
    else {
      if (playerInstance.interval) {
        clearInterval(playerInstance.interval);
        playerInstance.interval = null;
      }

      try {
        const time = Math.floor(playerInstance.getCurrentTime());
        saveProgress(time);
      } catch { }
    }
  };

  const handleVideoSelect = (video) => {
    // Save current video progress
    if (player && selectedVideoId) {
      try {
        const time = Math.floor(player.getCurrentTime());
        saveProgress(time);
      } catch { }
    }

    if (player?.interval) {
      clearInterval(player.interval);
      player.interval = null;
    }

    lastSavedRef.current = 0;

    // ✅ USE THE VIDEO YOU CLICKED
    const vid =
      video?.snippet?.resourceId?.videoId ||
      video?.id;

    if (!vid) return;

    setSelectedVideo(video);
    setSelectedVideoId(vid);

    // Reset quiz state
    setShownQuizzes(new Set());
    setQuizQueue([]);
    setIsQuizActive(false);
    setCurrentQuiz(null);
  };



  /* ======================================================
     WATCH LATER
  ====================================================== */
  const handleWatchLater = async () => {
    if (!selectedVideo) return;

    const videoId =
      selectedVideo?.snippet?.resourceId?.videoId ||
      selectedVideo?.id;

    if (savedVideoIds.has(videoId)) return;

    try {
      setIsSaving(true);
      await axios.post(
        `${USER_API}/users/watch-later`,
        {
          videoId,
          title: selectedVideo.snippet.title,
          thumbnail: selectedVideo.snippet.thumbnails.medium.url,
          channelId,
          channelName: selectedVideo.snippet.channelTitle,
          courseId,
        },
        { withCredentials: true }
      );

      setSavedVideoIds((prev) => new Set(prev).add(videoId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save video");
    } finally {
      setIsSaving(false);
    }
  };

  /* ======================================================
     QUIZ HANDLERS
  ====================================================== */
  const handleQuizSubmit = (selectedAnswer) => {
    setTimeout(() => {
      if (player) {
        try {
          player.playVideo();
        } catch (err) {
          console.error("Error playing video:", err);
        }
      }
      setQuizQueue((prev) => prev.slice(1));
      setIsQuizActive(false);
      setCurrentQuiz(null);
    }, 2000);
  };

  const handleQuizClose = () => {
    if (player) {
      try {
        player.playVideo();
      } catch (err) {
        console.error("Error playing video:", err);
      }
    }
    setQuizQueue((prev) => prev.slice(1));
    setIsQuizActive(false);
    setCurrentQuiz(null);
  };

  /* ======================================================
     EFFECTS
  ====================================================== */

  // Fetch saved videos
  useEffect(() => {
    const fetchSavedVideos = async () => {
      try {
        const res = await axios.get(`${USER_API}/users/watch-later`, {
          withCredentials: true,
        });
        const ids = new Set(res.data.data.map((v) => v.videoId));
        setSavedVideoIds(ids);
      } catch (err) {
        console.error("Failed to fetch saved videos", err);
      }
    };
    fetchSavedVideos();
  }, []);

  // Fetch video progress
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get(
          `${USER_API}/users/video-progress/${courseId}/${channelId}`,
          { withCredentials: true }
        );

        const map = {};
        res.data.data.forEach((v) => {
          map[v.videoId] = v.watchedSeconds;
        });

        setVideoProgress(map);
      } catch (err) {
        console.error("Failed to fetch progress", err);
      }
    };
    fetchProgress();
  }, [courseId, channelId]);

  // Fetch channel info
  useEffect(() => {
    const fetchChannelFromBackend = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/channels/course/${courseId}`);
        const channel = res.data.find((c) => c._id === channelId);

        if (!channel) return;

        setChannelInfo({
          name: channel.name,
          imageUrl: channel.imageUrl,
        });
      } catch (err) {
        console.error("Failed to fetch channel", err);
      }
    };

    fetchChannelFromBackend();
  }, [courseId, channelId]);

  // Fetch playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/playlists`, {
          params: {
            channelId,
            courseId
          }
        });
        const data = response.data.data;
        if (Array.isArray(data) && data.length > 0) {
          setSelectedPlaylist(data[0]);
        } else {
          setSelectedPlaylist(null);
        }
      } catch (error) {
        console.error("Failed to fetch playlists:", error);
        setSelectedPlaylist(null);
      } finally {
        setLoading(false);
      }
    };
    if (channelId && courseId) fetchPlaylists();
  }, [channelId, courseId]);

  useEffect(() => {
    const fetchContent = async () => {
      if (!selectedPlaylist || !channelInfo) return;

      const contentLink = selectedPlaylist.link;
      const contentType = selectedPlaylist.type;

      let videoItems = [];

      try {
        // ===============================
        // 1️⃣ FETCH VIDEOS
        // ===============================
        if (contentType === "playlist") {
          const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${contentLink}&key=${YOUTUBE_API_KEY}&maxResults=50`;
          const playlistRes = await youtubeaxios.get(playlistUrl);

          videoItems = playlistRes.data.items || [];
        } else if (contentType === "video") {
          const videoId = contentLink; // 🔥 already a video ID

          if (!videoId) {
            console.error("❌ Missing videoId for single video");
            return;
          }

          const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
          const videoRes = await youtubeaxios.get(videoUrl);

          const videoItem = videoRes.data.items?.[0];

          if (videoItem) {
            videoItems = [
              {
                id: videoItem.id,
                snippet: {
                  ...videoItem.snippet,
                  resourceId: { videoId: videoItem.id },
                },
                contentDetails: videoItem.contentDetails,
              },
            ];
          }
        }



        if (!videoItems.length) return;

        setVideos(videoItems);

        // ===============================
        // 2️⃣ SELECT VIDEO (FIXED)
        // ===============================
        let initialVideo = null;

        if (targetVideoId) {
          initialVideo = videoItems.find((v) => {
            const vid =
              v?.snippet?.resourceId?.videoId ||
              v?.id;
            return vid === targetVideoId;
          });
        }

        if (!initialVideo) {
          initialVideo = videoItems[0];
        }

        const selectedVid =
          initialVideo?.snippet?.resourceId?.videoId ||
          initialVideo?.id;

        setSelectedVideo(initialVideo);
        setSelectedVideoId(selectedVid);

        // ===============================
        // 3️⃣ START LEARNING
        // ===============================
        try {
          await axios.post(
            `${USER_API}/users/start-learning`,
            {
              courseId,
              courseTitle: selectedPlaylist.courseId?.name || "Unknown Course",
              courseThumbnail: "",
              channelId,
              channelName: channelInfo.name,
              channelThumbnail: channelInfo.imageUrl || "",
            },
            { withCredentials: true }
          );

          console.log("✅ start-learning initialized");
        } catch (err) {
          console.error(
            "❌ start-learning failed",
            err.response?.data || err.message
          );
        }

        // ===============================
        // 4️⃣ FETCH DURATIONS (FIXED)
        // ===============================
        const videoIds = videoItems
          .map((v) => v?.snippet?.resourceId?.videoId || v?.id)
          .filter(Boolean)
          .join(",");

        if (videoIds) {
          const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
          const videosRes = await youtubeaxios.get(videosUrl);

          const newDurations = {};
          videosRes.data.items?.forEach((video) => {
            newDurations[video.id] = durationToSeconds(
              formatDuration(video.contentDetails.duration)
            );
          });

          setDurations(newDurations);
        }

        // ===============================
        // 5️⃣ FETCH QUIZZES
        // ===============================
        try {
          const quizRes = await axios.get(
            `${BASE_URL}/quizzes/by-playlist-document/${selectedPlaylist._id}`
          );

          if (quizRes.data.success) {
            const allQuestions =
              quizRes.data.data?.videos?.flatMap((v) =>
                v.questions.map((q) => ({
                  ...q,
                  videoId: v.videoId,
                }))
              ) || [];

            setQuizQuestions(allQuestions);
          } else {
            setQuizQuestions([]);
          }
        } catch {
          setQuizQuestions([]);
        }
      } catch (error) {
        console.error("❌ fetchContent failed", error);
      }
    };

    fetchContent();
  }, [selectedPlaylist, targetVideoId, channelInfo]);


  // Cleanup intervals
  useEffect(() => {
    return () => {
      if (player?.interval) {
        clearInterval(player.interval);
      }
    };
  }, [player]);

  // Trigger quiz modal
  useEffect(() => {
    if (!isQuizActive && quizQueue.length > 0) {
      const nextQuiz = quizQueue[0];
      setCurrentQuiz(nextQuiz);
      setIsQuizActive(true);
      if (player) {
        try {
          player.pauseVideo();
        } catch (err) {
          console.error("Error pausing video:", err);
        }
      }
    }
  }, [quizQueue, isQuizActive, player]);

  // Update course total
  useEffect(() => {
    if (!videos.length) return;

    const allDurationsReady = videos.every(
      (v) => durations[v.snippet.resourceId.videoId] > 0
    );

    if (!allDurationsReady) return;

    const totalPlaylistSeconds = videos.reduce((sum, v) => {
      const id = v.snippet.resourceId.videoId;
      return sum + (durations[id] || 0);
    }, 0);

    if (totalPlaylistSeconds > 0) {
      updateCourseTotal(totalPlaylistSeconds);
    }
  }, [videos, durations, courseId, channelId]);

  // Save progress on page unload
  useEffect(() => {
    const handleUnload = () => {
      if (player && selectedVideoId) {
        try {
          const time = Math.floor(player.getCurrentTime());
          saveProgress(time);
        } catch { }
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [player, selectedVideoId]);

  /* ======================================================
     GUARD CLAUSES
  ====================================================== */
  if (!channelId || !courseId) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Invalid Video Link</h2>
        <p className="text-gray-500 mt-2">Please open the video again.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!selectedPlaylist) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">No Content Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-8 px-8 py-3 bg-[#1A1A1A] text-white rounded-full font-bold hover:bg-black transition-colors shadow-lg hover:-translate-y-1"
        >
          Go Back
        </button>
      </div>
    );
  }

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <div className="min-h-screen bg-[#FDFBF9] font-sans selection:bg-[#D4F478] selection:text-black pb-20 relative overflow-x-hidden">
      {/* GLOBAL BACKGROUND BLOBS */}
      <div className="fixed inset-0 pointer-events-none -z-50">
        <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-t from-pink-50 to-transparent rounded-full blur-[120px] opacity-60" />
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8">

        {/* COMBINED NAVIGATION BAR - Back Button + User Avatar */}
        <div className="flex items-center justify-between mb-8 relative z-50">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-black font-bold transition-colors group cursor-pointer"
          >
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:shadow-md transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="hidden sm:inline">Back</span>
          </button>

          {/* User Avatar / Sign In Button */}
          {isAuthenticated && user ? (
            <div className="relative" ref={profileDropdownRef}>
              <UserAvatar
                image={user.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                name={user.name}
                onClick={handleProfileClick}
              />
              <AnimatePresence>
                {isProfileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-white/90 backdrop-blur-2xl border border-white rounded-[1.5rem] shadow-2xl overflow-hidden z-50 p-2"
                  >
                    <button onClick={handleDashboardClick} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                      <LayoutDashboard className="w-4 h-4 text-gray-400" /> Dashboard
                    </button>
                    <div className="h-px bg-gray-100 my-1 mx-2"></div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} className="px-6 py-2 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-colors">
              Sign In
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <PlayListPlayer
            video={selectedVideo}
            onPlayerReady={handlePlayerReady}
            onStateChange={handleStateChange}
            onWatchLater={handleWatchLater}
            isSaved={savedVideoIds.has(selectedVideoId)}
            isSaving={isSaving}
          />
          <PlayListSidebar
            videos={videos}
            durations={durations}
            onVideoSelect={handleVideoSelect}
            selectedVideoId={selectedVideoId}
            channelData={
              channelInfo || {
                name: "Loading...",
                imageUrl: "/fallback.jpg",
              }
            }
            videoProgress={videoProgress}
            channelId={channelId}
            courseId={courseId}
          />
        </div>
      </div>

      {isQuizActive && currentQuiz && (
        <QuizModal
          quiz={currentQuiz}
          onAnswer={handleQuizSubmit}
          onClose={handleQuizClose}
        />
      )}
    </div>
  );
}