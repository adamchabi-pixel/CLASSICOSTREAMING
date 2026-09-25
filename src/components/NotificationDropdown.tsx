import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  CheckCheck, 
  ExternalLink, 
  Sparkles, 
  Calendar, 
  X,
  UserPlus
} from "lucide-react";
import { APP_NOTIFICATIONS, AppNotification } from "../data/notifications";
import { useAuth } from "../context/AuthContext";

const STORAGE_KEY = "classico_read_notifications_v1";

export default function NotificationDropdown() {
  const { user, openAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = APP_NOTIFICATIONS.filter(n => !readIds.includes(n.id)).length;

  const markAllAsRead = () => {
    const allIds = APP_NOTIFICATIONS.map(n => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
    } catch (e) {
      console.warn("Could not save read notifications", e);
    }
  };

  const markSingleAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save read notification", e);
      }
    }
  };

  const handleActionClick = (notif: AppNotification) => {
    markSingleAsRead(notif.id);
    if (notif.actionType === "open_signup") {
      setIsOpen(false);
      openAuthModal("signup");
    } else if (notif.link?.url) {
      window.open(notif.link.url, "_blank", "noopener,noreferrer");
    }
  };

  const getBadgeStyle = (badgeColor?: string) => {
    switch (badgeColor) {
      case "amber":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "purple":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      case "sky":
        return "bg-sky-500/15 text-sky-300 border-sky-500/30";
      case "emerald":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Notification Bell Button - pure icon like the loupe, no circle frame */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        aria-label="News & Announcements"
        title="News & Announcements"
        className="relative p-2 text-zinc-300 hover:text-amber-400 transition-colors flex items-center justify-center cursor-pointer group focus:outline-none"
      >
        <Bell className="w-5 h-5 transition-transform group-hover:rotate-12" />
        
        {/* Unread Glowing Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-[9px] font-black text-black font-mono shadow-[0_0_10px_rgba(245,158,11,0.8)] border border-black animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-x-3 sm:inset-x-auto sm:absolute sm:right-0 top-16 sm:top-12 sm:w-[420px] max-w-lg bg-[#0c0c0e]/95 backdrop-blur-2xl border border-zinc-800/90 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.06)] overflow-hidden z-[1000] text-left"
          >
            {/* Golden top highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-inner">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold font-['Montserrat',sans-serif] tracking-wider uppercase text-white">
                    News & Announcements
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    {unreadCount > 0 ? `${unreadCount} unread announcement${unreadCount > 1 ? 's' : ''}` : "All announcements are read"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    title="Mark all as read"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 text-[10px] text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer border border-zinc-700/50"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications Feed */}
            <div className="max-h-[65vh] sm:max-h-[460px] overflow-y-auto custom-scrollbar divide-y divide-zinc-850 p-2 sm:p-3 space-y-2">
              {APP_NOTIFICATIONS.map((notif) => {
                const isUnread = !readIds.includes(notif.id);
                return (
                  <div
                    key={notif.id}
                    onClick={() => markSingleAsRead(notif.id)}
                    className={`relative p-3.5 sm:p-4 rounded-2xl transition-all duration-200 cursor-pointer ${
                      isUnread 
                        ? "bg-amber-500/[0.04] border border-amber-500/30 hover:border-amber-400/50 shadow-sm shadow-amber-500/5" 
                        : "bg-neutral-900/40 border border-zinc-800/40 hover:bg-neutral-900/80 hover:border-zinc-700/60"
                    }`}
                  >
                    {/* Top Row: Badge & Date */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md border font-['Montserrat',sans-serif] ${getBadgeStyle(notif.badgeColor)}`}>
                          {notif.badge}
                        </span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)] animate-pulse" />
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span>{notif.date}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs sm:text-sm font-bold text-white mb-1.5 leading-snug font-['Montserrat',sans-serif] group-hover:text-amber-300">
                      {notif.title}
                    </h4>

                    {/* Abridged Essential Content */}
                    <p className="text-[11px] sm:text-xs text-zinc-300/90 leading-relaxed font-sans mb-3">
                      {notif.content}
                    </p>

                    {/* Bottom Action / Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-[10px] italic text-amber-400/80 font-medium">
                        — {notif.author}
                      </span>

                      {notif.link && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(notif);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-[10px] sm:text-[11px] font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
                        >
                          {notif.actionType === "open_signup" ? (
                            <>
                              <UserPlus className="w-3 h-3 text-amber-400" />
                              <span>{user ? "View my account" : notif.link.label}</span>
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-3 h-3 text-amber-400" />
                              <span>{notif.link.label}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Brand Bar */}
            <div className="p-3 bg-black/60 border-t border-zinc-800/80 text-center">
              <span className="text-[10px] tracking-widest uppercase text-zinc-400 font-cinzel">
                Classico Official Feed
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
