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
    title: "Classico Accounts & Cult Avatars Available",
    date: "2026/09/23",
    badge: "NEW",
    badgeColor: "amber",
    content: "You can now create your Classico account in two simple steps! Enter your username, email, password, and favorite genre, then pick your avatar from our 25 cult icons (Tony Montana, Vito Corleone, Walter White, Thomas Shelby...). Your watch history and playback progress are automatically saved.",
    author: "The Classico Team",
    actionType: "open_signup",
    link: {
      label: "Create my account",
      url: "#signup",
      external: false
    }
  },
  {
    id: "notif-animco-live-20260818",
    title: "ANIMCO IS OFFICIALLY LIVE",
    date: "2026/08/18",
    badge: "RELEASE",
    badgeColor: "purple",
    content: "After dedicated work behind the scenes, our brand new anime streaming platform ANIMCO has launched! Engineered for ultra-fast, smooth, uninterrupted playback.",
    author: "The Classico Team",
    actionType: "open_link",
    link: {
      label: "Discover Animco",
      url: "https://animcostreaming.com",
      external: true
    }
  },
  {
    id: "notif-browser-announcement-20260801",
    title: "Browser Recommendations",
    date: "2026/08/01",
    badge: "ANNOUNCEMENT",
    badgeColor: "sky",
    content: "For optimal loading speeds and smooth playback, we recommend Google Chrome on desktop and Safari on iPhone / iPad. Our video players perform best on them.",
    author: "The Classico Team"
  },
  {
    id: "notif-website-update-20260720",
    title: "Site Update & High-Speed Servers",
    date: "2026/07/20",
    badge: "UPDATE",
    badgeColor: "emerald",
    content: "Deployment of a refreshed Player 1 (ad-free) and dedicated high-speed servers for movie lovers. Interface responsiveness and video playback controls have also been modernized.",
    author: "The Classico Team"
  }
];
