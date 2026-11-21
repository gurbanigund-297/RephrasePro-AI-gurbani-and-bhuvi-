import type { WritingStyle, ToneOption } from "../types/rephrase.ts";

export interface SamplePreset {
  id: string;
  label: string;
  recommendedStyle: WritingStyle;
  recommendedTone: ToneOption;
  text: string;
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: "executive-update",
    label: "Executive Update",
    recommendedStyle: "Professional",
    recommendedTone: "Confident",
    text: "Hi team, just wanted to let you know that the Q3 onboarding redesign is kinda behind schedule because we ran into some unexpected API latency issues last week. Me and engineering are working hard to get the fix deployed by Thursday, and once that's done we should be able to launch to beta customers early next week without affecting the rest of the roadmap.",
  },
  {
    id: "academic-draft",
    label: "Research Abstract",
    recommendedStyle: "Academic",
    recommendedTone: "Neutral",
    text: "Our study looked at how urban tree canopies help cool down city neighborhoods during really hot summer heatwaves. We measured surface temperatures across twelve city blocks and found that streets with dense tree cover stayed noticeably cooler in the afternoon than streets with mostly concrete. This shows city planners should plant more native shade trees to protect vulnerable residents.",
  },
  {
    id: "client-apology",
    label: "Client Follow-Up",
    recommendedStyle: "Friendly",
    recommendedTone: "Empathetic",
    text: "Hey Sarah, sorry for taking so long to get back to you on the contract revisions. Things got super hectic on our end after the conference, and your email slipped down my inbox. I've attached the updated draft with the pricing changes we talked about—let me know if anything looks off or if you want to hop on a quick call tomorrow.",
  },
  {
    id: "product-story",
    label: "Launch Copy",
    recommendedStyle: "Creative",
    recommendedTone: "Persuasive",
    text: "Most note-taking apps start out simple and slowly turn into complicated workspaces that get in the way of your actual thoughts. QuietDesk gives you a fast, distraction-free page that opens instantly whenever an idea strikes, keeping your drafts organized without forcing you to learn a dozen menus.",
  },
];
