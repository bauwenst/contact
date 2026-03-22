import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Phone, GraduationCap, Link, QrCode, Check } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

var data = require("./data.json")

const icons = [
  { id: "linkedin", icon: Linkedin, link: "https://linkedin.com/in/" + data["linkedin"]},
  { id: "github", icon: Github, link: "https://github.com/" + data["github"]},
  { id: "phone", icon: Phone },
  { id: "email", icon: Mail },
  { id: "scholar", icon: GraduationCap, link: "https://scholar.google.com/citations?user=" + data["scholar"]},
];

function buildPhone() {
  return "+" + data["phone"].map(x => x+1).map(x => x.toString()).join(" ");
}

function buildEmail() {
  return data["email"]["prefix"].join("") + "@" + data["email"]["suffix"].join(".");
}
 
export default function ContactPage() {
  const [revealed, setRevealed] = useState({ phone: false, email: false });
  const [copied, setCopied] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [url, setUrl] = useState("");

  const [radius, setRadius] = useState(140);

  useEffect(() => {
    const updateRadius = () => {
      const w = window.innerWidth;
      // responsive scaling
      if (w < 500) setRadius(110);
      else if (w < 800) setRadius(150);
      else setRadius(240);
    };

    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href);
    }
  }, []);

  const getValue = (id) =>
    id === "phone" ? buildPhone() : buildEmail();

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1000);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
      {/* Subtle glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />

      {/* QR Button */}
      <button
        onClick={() => setShowQR(true)}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:scale-110 active:scale-95 transition z-50"
      >
        <QrCode />
      </button>

      {/* QR Modal */}
      {showQR && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white p-6 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <QRCodeCanvas value={url} size={192} />
          </div>
        </div>
      )}

      {/* Name */}
      <h1 className="absolute text-3xl md:text-5xl font-semibold tracking-tight leading-tight text-center" style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}>
        <div>{data["name"]["first"]}</div>
        <div>{data["name"]["last"]}</div>
      </h1>
      {/* Icons */}
      <div className="relative w-[400px] h-[400px]">
        {icons.map((item, i) => {
          const angle = (i / icons.length) * 2 * Math.PI - Math.PI / 2;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          const Icon = item.icon;

          const isRevealable = item.id === "phone" || item.id === "email";
          const isRevealed = revealed[item.id];
          const value = getValue(item.id);

          return (
            <div
              key={item.id}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <motion.div
                style={{ x, y }}
                animate={{ y: [y, y - 8, y] }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <button
                  onClick={() => {
                    if (isRevealable) {
                      setRevealed((prev) => ({
                        ...prev,
                        [item.id]: true,
                      }));
                    } else if (item.link) {
                      window.open(item.link, "_blank");
                    }
                  }}
                  className="group relative w-16 h-16 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg hover:shadow-blue-500/40 hover:scale-110 cursor-pointer transition-all duration-300"
                >
                  {/* Glow */}
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl opacity-70 group-hover:opacity-100 transition" />

                  {/* Content */}
                  {isRevealable && !isRevealed ? (
                    <>
                      <Icon className="w-6 h-6 group-hover:opacity-0 transition" />
                      <span className="absolute text-xs opacity-0 group-hover:opacity-100 transition">
                        Show
                      </span>
                    </>
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}

                  {/* Revealed info + copy */}
                  {isRevealable && isRevealed && (
                    <div className="absolute top-20 flex items-center gap-2">
                      <div className="text-xs whitespace-nowrap bg-black/70 px-3 py-1 rounded-md">
                        {value}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(value, item.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:scale-110 active:scale-95 transition"
                      >
                        {copied === item.id ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Link className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </button>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

