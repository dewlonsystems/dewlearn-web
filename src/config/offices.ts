export interface Office {
  id: string;
  name: string;
  tag: string;
  location: string;
  hours: string[];
  remote?: boolean;
}

export const offices: Office[] = [
  {
    id: "nairobi",
    name: "Nairobi – Head Office",
    tag: "Main office",
    location: "Imara Daima, Nairobi, Kenya",
    hours: ["Mon – Fri · 8 AM – 6 PM EAT", "Sat · 9 AM – 1 PM (support only)"],
  },
  {
    id: "kisii",
    name: "Kisii Branch",
    tag: "Branch office",
    location: "Kisii Town, Western Kenya",
    hours: ["Mon – Fri · 8 AM – 5 PM EAT"],
  },
  {
    id: "remote",
    name: "Remote / Worldwide",
    tag: "Remote",
    location: "Secure online collaboration, no visit needed",
    hours: ["Available across time zones by arrangement"],
    remote: true,
  },
];

export const mapEmbedUrl =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.7462261944165!2d36.879366673500805!3d-1.3282727356703694!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8cf707a8037af4c5%3A0xee11ac63b098888d!2sDewlon%20Systems!5e0!3m2!1sen!2ske!4v1773277557927!5m2!1sen!2ske";

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Dewlon Systems, Imara Daima, Nairobi")}`;