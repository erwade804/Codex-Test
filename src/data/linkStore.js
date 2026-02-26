const categories = [
  {
    id: "core-daily-tools",
    title: "Core Daily Tools",
    description: "Your always-open systems for daily triage and operations.",
    links: [
      {
        id: "powerschool",
        name: "PowerSchool",
        url: "https://oxfordcs.powerschool.com/admin/home.html",
        meta: "SIS / attendance / student info"
      },
      {
        id: "google-drive",
        name: "IT  Drive",
        url: "https://drive.google.com/drive/folders/1QFpMlU0nzf-JIolfMwbMRPaqseKdZHLB",
        meta: "Files, docs, and shared folders"
      },
      {
        id: "incident-iq",
        name: "Incident IQ",
        url: "https://brad.oxboe.com/iiq/",
        meta: "Help desk tickets and asset context"
      },
      {
        id: "mosyle",
        name: "Mosyle",
        url: "https://myschool.mosyle.com/",
        meta: "Apple device management"
      }
    ]
  },
  {
    id: "apple-identity",
    title: "Apple + Identity",
    description: "Anything tied to Apple ecosystem setup and account work.",
    links: [
      {
        id: "apple-school-manager",
        name: "Apple School Manager",
        url: "https://school.apple.com/",
        meta: "Managed Apple IDs"
      },
      {
        id: "google-admin",
        name: "Google Admin",
        url: "https://admin.google.com/",
        meta: "Users, groups, policies"
      }
    ]
  },
  {
    id: "legacy-ops-links",
    title: "Legacy Ops Links",
    description: "Former legacy-home shortcuts now organized in the modern dashboard.",
    links: [
      {
        id: "brads-desk",
        name: "Brad's Desk",
        url: "http://ws-wh-brad/iiq",
        meta: "Local Incident IQ endpoint"
      },
      {
        id: "it-drive-shared",
        name: "IT Drive",
        url: "https://drive.google.com/drive/folders/0AL8p7-QY94qTUk9PVA",
        meta: "Shared Google Drive resources"
      },
      {
        id: "cards-sandbox",
        name: "Cards",
        url: "http://srv-boe-sandbox:85/",
        meta: "Sandbox cards utility"
      },
      {
        id: "lifelink",
        name: "LifeLink",
        url: "https://lifelink.lifenetsystems.com/",
        meta: "AED support portal"
      }
    ]
  }
];

module.exports = {
  categories
};
