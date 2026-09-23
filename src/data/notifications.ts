export interface AppNotification {
  id: string;
  title: string;
  date: string; // YYYY/MM/DD format
  badge: string;
  badgeColor?: string;
  content: string;
  author: string;
  link?: {
    label: string;
    url: string;
    external?: boolean;
  };
  actionType?: "open_signup" | "open_link";
}

export const APP_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-account-creation-20260923",
    title: "Classico Accounts & Cult Avatars Now Live",
    date: "2026/09/23",
    badge: "NEW FEATURE",
    badgeColor: "amber",
    content: "You can now create your Classico account in two simple steps! Enter your username, email, password, and favorite movie genre, then pick your legendary cult character avatar from 25 cinema and series icons (Tony Montana, Vito Corleone, Walter White, Thomas Shelby, etc.). Your watch history, watchlist, and resume progress sync automatically.",
    author: "Classico team",
    actionType: "open_signup",
    link: {
      label: "Create My Account",
      url: "#signup",
      external: false
    }
  },
  {
    id: "notif-animco-live-20260818",
    title: "ANIMCO. IS OFFICIALLY LIVE",
    date: "2026/08/18",
    badge: "RELEASE",
    badgeColor: "purple",
    content: "After a lot of work behind the scenes, our brand-new anime streaming platform ANIMCO is live! Built to deliver a faster, smoother, and ad-free anime viewing experience. If you love anime, check it out and share your thoughts.",
    author: "Classico team",
    actionType: "open_link",
    link: {
      label: "Watch on Animco",
      url: "https://animcostreaming.com",
      external: true
    }
  },
  {
    id: "notif-browser-announcement-20260801",
    title: "Browser Compatibility Recommendation",
    date: "2026/08/01",
    badge: "ANNOUNCEMENT",
    badgeColor: "sky",
    content: "For optimal playback and faster stream loading, please use Google Chrome on PC and Safari on iPhone / iPad. Microsoft Edge and Opera currently experience occasional playback issues—our team is working on full compatibility updates.",
    author: "Classico team"
  },
  {
    id: "notif-website-update-20260720",
    title: "New Website Update & French Server",
    date: "2026/07/20",
    badge: "UPDATE",
    badgeColor: "emerald",
    content: "Rolled out a brand-new Server 1 (completely ad-free) and a dedicated French server for French-speaking cinephiles. The overall layout and player controls were also updated for a sleeker, cleaner experience.",
    author: "Classico team"
  }
];
