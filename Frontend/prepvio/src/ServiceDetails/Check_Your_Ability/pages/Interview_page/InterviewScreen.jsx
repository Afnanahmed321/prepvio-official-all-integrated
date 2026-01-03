import React, { useState, useEffect, useCallback, useRef } from "react";
import { PhoneOff, MessageSquare, Code, Maximize, Minimize, X, Mic, ListChecks, Play, Code2, Terminal, CheckCircle2, XCircle, ArrowRight, TrendingUp, Activity, AlertCircle, Users, Briefcase } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1, ease: "easeOut" } },
};

const itemUpVariants = {
  hidden: { y: 40, opacity: 0, scale: 0.95 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 20, mass: 0.8 } },
};

const itemSideVariants = (direction = "left") => ({
  hidden: { x: direction === "left" ? -40 : 40, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 20 } },
});

const hoverCardEffect = {
  y: -8, scale: 1.01, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)", transition: { type: "spring", stiffness: 300, damping: 20 },
};

// --- Code Editor Modal Component (Updated UI) ---
const CodeEditorModal = ({ isOpen, onClose, problem, onSuccess, onSkip }) => {
  const [language, setLanguage] = useState("javascript");
  const [editorValue, setEditorValue] = useState("");
  const [output, setOutput] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const generateBoilerplate = (problemObj, lang) => {
    if (!problemObj) return "";

    const title = `// ${problemObj.title}\n`;
    const desc =
      problemObj.description
        ?.split("\n")
        .map((l) => `// ${l}`)
        .join("\n") + "\n\n";

    const fn = problemObj.functionName || "solve";

    if (lang === "javascript") {
      return `${title}${desc}function ${fn}(${problemObj.params || ""}) {\n  // TODO\n}\n`;
    }

    if (lang === "python") {
      return `${title}${desc}def ${fn}(${problemObj.params || ""}):\n    pass\n`;
    }

    if (lang === "cpp") {
      return `${title}${desc}#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  return 0;\n}`;
    }

    return "";
  };

  useEffect(() => {
    if (!problem) return;
    const val = generateBoilerplate(problem, language);
    setEditorValue(val);
  }, [problem, language]);

  const handleRun = async () => {
    if (!editorValue || !problem?.testCases) {
      setOutput([{ id: 0, output: "No test cases available." }]);
      return;
    }

    setLoading(true);
    setOutput([{ id: 0, output: "Running test cases..." }]);

    try {
      const results = [];
      let allPassed = true;

      for (let i = 0; i < problem.testCases.length; i++) {
        const t = problem.testCases[i];

        const runner =
          language === "python"
            ? `\nprint(${problem.functionName}(${t.input}))`
            : language === "cpp"
              ? `\n#include <iostream>\nint main(){ std::cout << ${problem.functionName}(${t.input}); }`
              : `\nconsole.log(${problem.functionName}(${t.input}));`;

        const res = await fetch("http://localhost:5000/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language,
            code: editorValue + runner,
          }),
        });

        const data = await res.json();
        const out =
          data.run?.output?.trim() ||
          data.run?.stderr?.trim() ||
          "No output";

        const passed = out === String(t.expected).trim();
        if (!passed) allPassed = false;

        results.push({
          id: i + 1,
          input: t.input,
          expected: t.expected,
          output: out,
          passed,
        });
      }

      setOutput(results);

      if (allPassed) {
        setTimeout(() => {
          onSuccess(editorValue, results);
        }, 600);
      }
    } catch {
      setOutput([{ id: 0, output: "Execution failed. Backend error." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-7xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-[#1A1A1A] to-gray-900 text-white relative flex border border-gray-800"
      >
        {/* LEFT PANEL */}
        <aside className="w-[360px] bg-gradient-to-b from-gray-900 to-black border-r border-gray-800 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-[#D4F478] mb-3 tracking-tight">
            {problem?.title || "Waiting..."}
          </h2>

          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            {problem?.description}
          </p>

          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-bold">
            Test Cases
          </h3>

          <div className="space-y-3">
            {problem?.testCases?.map((t, i) => (
              <div
                key={i}
                className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm hover:bg-gray-800/80 transition-colors"
              >
                <div>
                  <span className="text-gray-500">Input:</span> <span className="text-gray-300">{t.input}</span>
                </div>
                <div>
                  <span className="text-gray-500">Expected:</span> <span className="text-[#D4F478] font-medium">{t.expected}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <section className="flex-1 flex flex-col">
          {/* TOP BAR */}
          <header className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#D4F478]"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
            </select>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRun}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 text-sm font-bold text-white transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4" />
                Run
              </button>

              <button
                onClick={() => onSkip(editorValue)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 text-sm font-bold text-gray-300 transition-all hover:scale-[1.02]"
              >
                Skip
              </button>

              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 text-gray-300 transition-all hover:scale-[1.02]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* EDITOR */}
          <div className="px-6 py-5 flex-1">
            <div className="h-full bg-[#0f0f0f] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
              <Editor
                height="100%"
                theme="vs-dark"
                language={language === "cpp" ? "cpp" : language}
                value={editorValue}
                onChange={(val) => setEditorValue(val || "")}
                options={{
                  fontSize: 15,
                  minimap: { enabled: false },
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* OUTPUT */}
          <div className="px-6 pb-6">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-5">
              <h3 className="text-[#D4F478] font-bold mb-4 tracking-wide flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Execution Results
              </h3>

              <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {output.map((r, i) => (
                  <div
                    key={i}
                    className={`rounded-xl px-4 py-3 text-sm ${r.id === 0
                      ? "bg-gray-800/50 border border-gray-700"
                      : r.passed
                        ? "bg-gradient-to-r from-green-900/20 to-emerald-900/10 border border-emerald-800/30"
                        : "bg-gradient-to-r from-red-900/20 to-rose-900/10 border border-rose-800/30"
                      }`}
                  >
                    {r.id !== 0 ? (
                      <>
                        <div className="font-bold mb-2 flex items-center justify-between">
                          <span className="text-white">Test {r.id}</span>
                          <span
                            className={`flex items-center gap-1 ${r.passed ? "text-emerald-400" : "text-rose-400"
                              }`}
                          >
                            {r.passed ? "✓ Passed" : "✗ Failed"}
                          </span>
                        </div>
                        <div className="text-gray-300">
                          <div>
                            <span className="text-gray-500">Output:</span> {r.output}
                          </div>
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-300">{r.output}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

const SolvedProblemsModal = ({ isOpen, onClose, problems }) => {
  const [selected, setSelected] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex bg-gradient-to-br from-[#1A1A1A] to-gray-900 text-white relative border border-gray-800"
      >
        {/* SIDEBAR */}
        <aside className="w-[340px] bg-gradient-to-b from-gray-900 to-black border-r border-gray-800 p-5 overflow-y-auto">
          <h2 className="text-xl font-bold text-[#D4F478] mb-6 tracking-tight">
            Solved Problems
          </h2>

          {problems.length === 0 && (
            <p className="text-sm text-gray-500">
              No problems solved yet.
            </p>
          )}

          <div className="space-y-3">
            {problems.map((p, i) => {
              const active = selected === p;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(p)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${active
                    ? "bg-gradient-to-r from-gray-800 to-gray-900 border-[#D4F478]/40 shadow-lg"
                    : "bg-gray-800/30 hover:bg-gray-800/50 border-gray-700 hover:border-gray-600"
                    }`}
                >
                  <div className="font-bold text-sm text-white">
                    {p.problem.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(p.solvedAt).toLocaleString()}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="flex-1 p-6 overflow-y-auto">
          {!selected && (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a solved problem to view details
            </div>
          )}

          {selected && (
            <div className="max-w-4xl">
              {/* HEADER */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#D4F478] mb-3">
                  {selected.problem.title}
                </h2>

                {selected.skipped && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-900/20 to-red-900/10 border border-rose-800/30 text-rose-400 text-sm font-bold">
                    <XCircle className="w-4 h-4" />
                    Skipped
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              <div className="mb-8 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-5">
                <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-bold">
                  Problem Description
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                  {selected.problem.description}
                </p>
              </div>

              {/* SOLUTION */}
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                  <Code2 className="w-5 h-5 text-[#D4F478]" />
                  Your Solution
                </h3>

                {selected.skipped ? (
                  <p className="text-sm text-gray-500 italic">
                    No code submitted for this problem.
                  </p>
                ) : (
                  <div className="h-[280px] bg-[#0f0f0f] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <Editor
                      height="100%"
                      language="javascript"
                      value={selected.userCode || "// No code submitted"}
                      theme="vs-dark"
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        fontSize: 15,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* TEST RESULTS */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">
                  Test Case Results
                </h3>

                {selected.skipped ? (
                  <p className="text-sm text-gray-500 italic">
                    No test results available.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {selected.testResults.map((r, idx) => (
                      <div
                        key={idx}
                        className={`rounded-2xl p-4 border ${r.passed
                          ? "bg-gradient-to-r from-emerald-900/10 to-green-900/5 border-emerald-800/30"
                          : "bg-gradient-to-r from-rose-900/10 to-red-900/5 border-rose-800/30"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-white">
                            Test Case {idx + 1}
                          </span>
                          <span
                            className={`flex items-center gap-1 font-bold ${r.passed ? "text-emerald-400" : "text-rose-400"
                              }`}
                          >
                            {r.passed ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" /> Passed
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" /> Failed
                              </>
                            )}
                          </span>
                        </div>

                        <div className="text-gray-300 space-y-2">
                          <div>
                            <span className="text-gray-500">Input:</span>{" "}
                            <span className="font-mono">{r.input}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Expected:</span>{" "}
                            <span className="text-[#D4F478] font-mono">{r.expected}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Output:</span>{" "}
                            <span className="font-mono">{r.output}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border border-gray-700 text-gray-300 transition-all hover:scale-[1.02]"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};

// --- Enhanced Model Component with Dynamic Speech ---
function DynamicModel({ speechText, onSpeechEnd, ...props }) {
  const { nodes, materials } = useGLTF('/final_prepvio_model.glb');
  const meshRef = useRef();
  const headBoneRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    Object.values(materials || {}).forEach((mat) => (mat.morphTargets = true));
  }, [materials]);

  const letterToViseme = {
    a: 'aa', b: 'PP', c: 'CH', d: 'DD', e: 'E', f: 'FF',
    g: 'DD', h: 'sil', i: 'E', k: 'DD', l: 'nn', m: 'PP',
    n: 'nn', o: 'oh', p: 'PP', r: 'aa', s: 'SS', t: 'DD',
    u: 'oh', v: 'FF', w: 'oh', x: 'SS', y: 'E', z: 'SS',
    ' ': 'sil'
  };

  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [chars, setChars] = useState([]);
  const morphKeys = nodes?.rp_carla_rigged_001_geo?.morphTargetDictionary || {};

  useEffect(() => {
    if (!speechText) {
      setChars([]);
      setCurrentCharIndex(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.2;

    let voices = window.speechSynthesis.getVoices();

    const setFemaleVoice = () => {
      voices = window.speechSynthesis.getVoices();
      const femaleVoice =
        voices.find(v => v.name.toLowerCase().includes("female")) ||
        voices.find(v => v.name.toLowerCase().includes("woman")) ||
        voices.find(v => v.name.toLowerCase().includes("samantha")) ||
        voices.find(v => v.name.toLowerCase().includes("zira")) ||
        voices.find(v => v.name.toLowerCase().includes("google us")) ||
        voices[0];

      utterance.voice = femaleVoice;
    };

    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = setFemaleVoice;
    } else {
      setFemaleVoice();
    }

    utterance.onend = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentCharIndex(0);
      if (onSpeechEnd) onSpeechEnd();
    };

    utterance.onerror = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (onSpeechEnd) onSpeechEnd();
    };

    window.speechSynthesis.speak(utterance);

    const textChars = speechText.toLowerCase().split('');
    setChars(textChars);

    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i < textChars.length) {
        setCurrentCharIndex(i);
        i++;
      } else {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 150);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [speechText, onSpeechEnd]);

  useEffect(() => {
    if (nodes?.rp_carla_rigged_001_geo?.skeleton) {
      const head = nodes.rp_carla_rigged_001_geo.skeleton.bones.find((b) =>
        b.name.toLowerCase().includes('head')
      );
      if (head) headBoneRef.current = head;
    }
  }, [nodes]);

  const offsetY = useRef(Math.random() * 0.08);
  const offsetX = useRef(Math.random() * 0.05);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (headBoneRef.current) {
      headBoneRef.current.rotation.y = Math.sin(t * 0.4 + offsetY.current) * 0.02;
      headBoneRef.current.rotation.x = Math.sin(t * 0.3 + offsetX.current) * 0.04;
    }

    if (meshRef.current?.morphTargetInfluences && chars.length > 0) {
      const influences = meshRef.current.morphTargetInfluences;
      influences.fill(0);

      const char = chars[currentCharIndex];
      if (char) {
        const viseme = letterToViseme[char] || 'oh';
        const index = morphKeys[viseme];
        if (index !== undefined) influences[index] = 0.8;
      }
    }
  });

  if (!nodes?.rp_carla_rigged_001_geo) return null;

  return (
    <group
      {...props}
      position={[-0.48, -1.3, 3.967]}
      rotation={[1.9, 0, 0]}
      scale={0.01}
      dispose={null}
    >
      <skinnedMesh
        ref={meshRef}
        geometry={nodes.rp_carla_rigged_001_geo.geometry}
        material={nodes.rp_carla_rigged_001_geo.material}
        skeleton={nodes.rp_carla_rigged_001_geo.skeleton}
        morphTargetInfluences={nodes.rp_carla_rigged_001_geo.morphTargetInfluences || []}
        morphTargetDictionary={nodes.rp_carla_rigged_001_geo.morphTargetDictionary || {}}
      />
      <primitive object={nodes.root} />
    </group>
  );
}

useGLTF.preload('/final_prepvio_model.glb');

// --- API Constants ---
const FIREWORKS_API_URL = "https://api.fireworks.ai/inference/v1/chat/completions";
const BACKEND_UPLOAD_URL = "/api/upload";
const apiKey = "fw_3ZbHnsRsTg9cHxxESpgxzMim";

// --- Utilities: format problem for chat (keeps chat+editor in sync) ---
const generateReportContent = (messages, company, role) => {
  let content = `--- Mock Interview Report ---\n\n`;
  content += `Role: ${role}\n`;
  content += `Company Type: ${company}\n`;
  content += `Date: ${new Date().toLocaleDateString()}\n\n`;
  content += `--- Conversation Log ---\n\n`;

  messages.forEach((msg) => {
    content += `${msg.sender}: ${msg.text}\n`;

    if (msg.sender === "User" && msg.feedback) {
      const suggestion = msg.feedback.suggestion || "";
      const example = msg.feedback.example || "";
      content += `[Feedback]: ${suggestion}|||${example}\n`;
    }
  });

  content += `\n=== FINAL ANALYSIS ===\n\n`;
  content += `**Overall Performance Summary**\n`;
  content += `This interview covered both HR and technical aspects for the ${role} position.\n\n`;

  content += `**Key Strengths Observed**\n`;
  content += `- Engaged actively throughout the conversation\n`;
  content += `- Demonstrated willingness to learn and improve\n\n`;

  content += `**General Recommendations**\n`;
  content += `1. Continue practicing technical concepts relevant to ${role}\n`;
  content += `2. Use the STAR method for behavioral questions\n`;
  content += `3. Build small projects to demonstrate practical skills\n`;
  content += `4. Review feedback provided after each response above\n`;

  return content;
};

// --- Main InterviewScreen (Updated UI) ---
const InterviewScreen = ({
  companyType = "Tech Startup",
  role = "Full Stack Developer",
  setStage = () => { },
  userId = "user1"
}) => {
  const userVideoRef = useRef(null);
  const screenRef = useRef(null);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechBufferRef = useRef("");
  const location = useLocation();
  const highlightBufferRef = useRef([]);

  const isPreview = location.state?.isPreview === true;
  const previewSession = location.state?.previewSession;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [interviewStage, setInterviewStage] = useState("intro");
  const [currentAiSpeech, setCurrentAiSpeech] = useState("");
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [codingProblem, setCodingProblem] = useState(null);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [showSolvedProblems, setShowSolvedProblems] = useState(false);
  const [deviationWarnings, setDeviationWarnings] = useState(0);
  const [codingCount, setCodingCount] = useState(0);

  const navigate = useNavigate();

  const captureFrame = () => {
    const video = userVideoRef.current;

    if (
      !video ||
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.6);
  };

  const endInterview = useCallback(() => {
    console.log("Interview ended and resources cleaned.");
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (window.currentMediaStream) {
      window.currentMediaStream.getTracks().forEach(track => track.stop());
      window.currentMediaStream = null;
    }
    if (userVideoRef.current?.srcObject) {
      userVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      userVideoRef.current.srcObject = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsSpeaking(false);
    setIsRecording(false);
    setGreeted(false);
    setChatMessages([]);
    setError(null);
    console.log("✅ All media and states cleared.");
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("refreshFlag", "true");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    if (sessionStorage.getItem("refreshFlag") === "true") {
      sessionStorage.removeItem("refreshFlag");
      endInterview();
      navigate("/", { replace: true });
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [navigate, endInterview]);

  useEffect(() => {
    if (isPreview && previewSession?.messages) {
      setChatMessages(previewSession.messages);
      setSolvedProblems(previewSession.solvedProblems || []);
      setCameraAllowed(true);
    }
  }, [isPreview, previewSession]);

  useEffect(() => {
    const sessionId = location.state?.sessionId;

    if (!sessionId) {
      console.warn("⚠️ No sessionId found - nervousness detection disabled");
      return;
    }

    console.log("📹 Starting nervousness detection for session:", sessionId);

    let frameCount = 0;
    let successCount = 0;
    let errorCount = 0;

    const interval = setInterval(() => {
      frameCount++;

      const frame = captureFrame();

      if (!frame) {
        console.warn(`⚠️ Frame ${frameCount}: Capture returned null`);
        return;
      }

      fetch("http://127.0.0.1:5050/analyze-frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId,
          frame: frame,
          questionIndex: currentQuestionIndex
        })
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          return res.json();
        })
        .then(data => {
          successCount++;

          if (data.nervous && data.imageUrl) {
            highlightBufferRef.current.push({
              questionIndex: currentQuestionIndex,
              questionText: currentQuestionText,
              nervousScore: data.score,
              confidence: data.confidence,
              imageUrl: data.imageUrl,
              timestamp: new Date().toLocaleTimeString(),
              capturedAt: new Date(),
            });

            console.log(
              `🟡 Highlight appended for Q${currentQuestionIndex}`,
              data.imageUrl
            );
          }
        })
        .catch(err => {
          errorCount++;
          console.error(`❌ Frame ${frameCount} failed:`, err.message);

          if (errorCount % 10 === 0) {
            console.warn(`📊 Stats: ${successCount} success, ${errorCount} errors out of ${frameCount} frames`);
          }
        });
    }, 1000);

    return () => {
      clearInterval(interval);
      console.log(`📹 Detection stopped. Final stats: ${successCount} success, ${errorCount} errors out of ${frameCount} frames`);

      fetch("http://127.0.0.1:5050/cleanup-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      }).catch(err => console.error("Cleanup failed:", err));
    };
  }, [location.state?.sessionId, currentQuestionIndex, currentQuestionText]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.pathname);

    const handlePopState = (e) => {
      console.log("⬅️ User navigated back — ending interview and blocking forward navigation");

      window.history.pushState(null, "", window.location.pathname);

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (userVideoRef.current?.srcObject) {
        userVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
        userVideoRef.current.srcObject = null;
      }
      if (window.currentMediaStream) {
        window.currentMediaStream.getTracks().forEach(track => track.stop());
        window.currentMediaStream = null;
      }

      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  useEffect(() => {
    return () => {
      endInterview();
    };
  }, [endInterview]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const formatHistoryForFireworks = useCallback((history) => {
    return history.map((msg) => ({
      role: msg.sender === "AI" ? "assistant" : "user",
      content: msg.text,
    }));
  }, []);

  const fetchFireworksContent = useCallback(async (messages, systemInstruction) => {
    const messagesWithSystem = [
      { role: "system", content: systemInstruction },
      ...messages
    ];

    try {
      const res = await fetch(FIREWORKS_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          model: "accounts/fireworks/models/deepseek-v3p1",
          messages: messagesWithSystem
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("API Error:", errorText);
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      return data?.choices?.[0]?.message?.content || "No response";
    } catch (err) {
      console.error("Fireworks API Error:", err);
      throw err;
    }
  }, []);

  const generateFeedbackForAnswer = useCallback(async (userAnswer, aiQuestion) => {
    try {
      const feedbackPrompt = `You are an interview coach analyzing a candidate's answer.

Previous Question: "${aiQuestion}"
Candidate's Answer: "${userAnswer}"

Provide constructive feedback in this EXACT format (no additional text):
SUGGESTION: [One specific improvement suggestion in 1-2 sentences]
EXAMPLE: [A better way to phrase the answer in 1 sentence]

Keep it concise and actionable.`;

      const feedbackMessages = [
        { role: "user", content: feedbackPrompt }
      ];

      const feedbackText = await fetchFireworksContent(feedbackMessages, "You are a helpful interview coach providing brief, actionable feedback.");

      const suggestionMatch = feedbackText.match(/SUGGESTION:\s*(.+?)(?=EXAMPLE:|$)/s);
      const exampleMatch = feedbackText.match(/EXAMPLE:\s*(.+?)$/s);

      return {
        suggestion: suggestionMatch ? suggestionMatch[1].trim() : "Keep practicing to improve your interview responses.",
        example: exampleMatch ? exampleMatch[1].trim() : ""
      };
    } catch (err) {
      console.error("Feedback generation error:", err);
      return {
        suggestion: "Consider providing more specific examples from your experience.",
        example: "Try structuring your answer with concrete details about what you did and what you achieved."
      };
    }
  }, [fetchFireworksContent]);

  const fetchAndFormatCodingProblem = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/interview/fireworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error("Failed to generate coding problem");
      }

      const data = await response.json();

      if (data.title && data.description && data.testCases) {
        return {
          problem: data,
          questionText: formatProblemForChat(data)
        };
      }

      const raw = data?.choices?.[0]?.message?.content?.trim() || "";
      let clean = raw.replace(/```json|```/g, "");
      const objMatch = clean.match(/\{[\s\S]*\}/);

      if (!objMatch) {
        const fallback = {
          title: "Coding Challenge",
          description: raw,
          example: "",
          testCases: []
        };
        return {
          problem: fallback,
          questionText: formatProblemForChat(fallback)
        };
      }

      const parsed = JSON.parse(objMatch[0]);
      return {
        problem: parsed,
        questionText: formatProblemForChat(parsed)
      };

    } catch (err) {
      console.error("Coding problem fetch error:", err);
      throw err;
    }
  }, []);

  const formatProblemForChat = useCallback((problem) => {
    const title = problem.title || "Coding Challenge";
    const desc = problem.description || "";
    const example = problem.example ? `Example:\n${problem.example}` : "";
    const tests = problem.testCases?.length
      ? "\nTest Cases:\n" +
      problem.testCases.map(
        (tc, i) => `${i + 1}. Input: ${tc.input} → Expected: ${tc.expected}`
      ).join("\n")
      : "";

    return `${title}\n\n${desc}\n\n${example}${tests}\n\nYou can use the Code Editor to solve this problem.`;
  }, []);

  const handleSpeechEnd = useCallback(() => {
    setIsSpeaking(false);
    setCurrentAiSpeech("");
    setTimeout(() => startSpeechRecognition(), 500);
  }, []);

  const textToSpeech = useCallback((text) => {
    if (!text) return;
    setIsSpeaking(true);
    setCurrentAiSpeech(text);
  }, []);

  const handleSendMessage = useCallback(
    async (text) => {
      const messageToSend = text.trim();
      if (!messageToSend || isLoadingAI || isSpeaking) return;

      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
        setIsRecording(false);
      }

      setError(null);
      setInputValue("");

      const lastAiMessage =
        chatMessages.filter((m) => m.sender === "AI").slice(-1)[0];
      const lastAiQuestion = lastAiMessage ? lastAiMessage.text : "";

      const userMsg = {
        sender: "User",
        text: messageToSend,
        time: new Date().toLocaleTimeString(),
        stage: interviewStage,
        feedback: null,
      };

      setChatMessages((prev) => [...prev, userMsg]);

      const aiCount = (stage) =>
        chatMessages.filter(
          (m) => m.sender === "AI" && m.stage === stage
        ).length;

      const introQ = aiCount("intro");
      const transQ = aiCount("transition");
      const techQ = aiCount("technical");

      if (interviewStage === "intro" && introQ >= 2) {
        const msg = "Great. Let's move forward. I'll now ask you a few pre-technical questions.";
        setInterviewStage("transition");
        setIsLoadingAI(false);

        setChatMessages((prev) => [
          ...prev,
          {
            sender: "AI",
            text: msg,
            time: new Date().toLocaleTimeString(),
            stage: "transition",
          },
        ]);

        textToSpeech(msg);
        return;
      }

      if (interviewStage === "transition" && transQ >= 1) {
        const msg = "Now let's begin the technical round. I'll ask you concept-based questions.";
        setInterviewStage("technical");
        setIsLoadingAI(false);

        setChatMessages((prev) => [
          ...prev,
          {
            sender: "AI",
            text: msg,
            time: new Date().toLocaleTimeString(),
            stage: "technical",
          },
        ]);

        textToSpeech(msg);
        return;
      }

      if (interviewStage === "technical" && techQ >= 4) {
        const msg = "That concludes the technical round. We will now move to the coding round.";

        setChatMessages((prev) => [
          ...prev,
          {
            sender: "AI",
            text: msg,
            time: new Date().toLocaleTimeString(),
            stage: "technical",
          },
        ]);

        textToSpeech(msg);

        setTimeout(async () => {
          setInterviewStage("coding");
          try {
            const { problem } = await fetchAndFormatCodingProblem();
            setCodingProblem(problem);

            setChatMessages((prev) => [
              ...prev,
              {
                sender: "AI",
                text: "Your first coding problem is ready. Please open the Code Editor.",
                time: new Date().toLocaleTimeString(),
                stage: "coding",
              },
            ]);

            setTimeout(() => setIsCodeEditorOpen(true), 600);
          } catch (err) {
            setError("Failed to generate coding problem.");
          }
        }, 1000);

        return;
      }

      setIsLoadingAI(true);

      try {
        let systemInstruction = "";

        if (interviewStage === "intro")
          systemInstruction = `
You are an AI interviewer in the INTRO round.

RULES:
- Ask ONLY ONE question.
- Question length MUST be between 20 and 25 words.
- Ask an introductory HR question.
- Do NOT add explanations, examples, or follow-ups.
`;

        else if (interviewStage === "transition")
          systemInstruction = `
You are an AI interviewer in the TRANSITION round.

RULES:
- Ask ONLY ONE light technical or conceptual question.
- Question length MUST be between 20 and 25 words.
- No coding questions.
- No explanations or follow-ups.
`;

        else if (interviewStage === "technical")
          systemInstruction = `
You are an AI interviewer in the TECHNICAL round.

RULES:
- Ask ONLY ONE theory-based technical question.
- Question length MUST be between 20 and 25 words.
- No coding problems.
- No multi-part questions.
`;

        else if (interviewStage === "coding")
          systemInstruction = `
You are in the CODING round.
Do NOT ask questions. Wait for the user to solve the problem.
`;

        else if (interviewStage === "final")
          systemInstruction = `
You are an AI interviewer in the FINAL round.

RULES:
- Ask ONLY ONE wrap-up HR question.
- Question length MUST be between 20 and 25 words.
- Be concise and professional.
`;

        const formattedHistory = formatHistoryForFireworks([
          ...chatMessages,
          userMsg,
        ]);

        const aiReplyRaw = await fetchFireworksContent(
          formattedHistory,
          systemInstruction
        );

        const aiReply = aiReplyRaw
          .split(" ")
          .slice(0, 25)
          .join(" ");

        setCurrentQuestionIndex(prev => prev + 1);
        setCurrentQuestionText(aiReply);

        const feedback = await generateFeedbackForAnswer(
          messageToSend,
          lastAiQuestion
        );

        setChatMessages((prev) => {
          const updated = [...prev];
          const idx = updated.map((m) => m.sender).lastIndexOf("User");
          if (idx !== -1) updated[idx].feedback = feedback;
          return updated;
        });

        setChatMessages((prev) => [
          ...prev,
          {
            sender: "AI",
            text: aiReply,
            time: new Date().toLocaleTimeString(),
            stage: interviewStage,
          },
        ]);

        textToSpeech(aiReply);
      }
      catch (err) {
        console.error("AI Error:", err);
        setError("AI failed to respond.");
      } finally {
        setIsLoadingAI(false);
      }
    },
    [
      isLoadingAI,
      isSpeaking,
      chatMessages,
      interviewStage,
      formatHistoryForFireworks,
      fetchFireworksContent,
      generateFeedbackForAnswer,
      fetchAndFormatCodingProblem,
      textToSpeech,
    ]
  );

  const startSpeechRecognition = useCallback(() => {
    if (isLoadingAI || isSpeaking) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech Recognition not supported in this browser.");
      return;
    }

    const speechBufferRefLocal = speechBufferRef;
    speechBufferRefLocal.current = "";

    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
    };

    let autoSendTimer = null;

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map(result => result[0].transcript)
        .join("");

      speechBufferRefLocal.current = transcript;
      setInputValue(transcript);

      if (autoSendTimer) {
        clearTimeout(autoSendTimer);
        autoSendTimer = null;
      }
    };

    recognition.onerror = (e) => {
      console.error("Speech Recognition Error:", e);
      if (e.error !== "no-speech") {
        setError("Error in speech recognition: " + e.error);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;

      autoSendTimer = setTimeout(() => {
        const finalText = speechBufferRefLocal.current.trim();

        if (finalText) {
          handleSendMessage(finalText);
          speechBufferRefLocal.current = "";
        }
      }, 3000);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Recognition start failed:", e);
      setIsRecording(false);
    }
  }, [isLoadingAI, isSpeaking, isRecording, handleSendMessage]);

  const handleEndInterview = useCallback(async () => {
    if (isLoadingAI || isSpeaking) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    const reportText = generateReportContent(chatMessages, companyType, role);
    const sanitizedRole = role.replace(/[^a-zA-Z0-9]/g, "_");
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
    const filename = `${sanitizedRole}_Report_${timestamp}.pdf`;

    setIsLoadingAI(true);
    setError("Analyzing the Interview");

    try {
      const response = await fetch(BACKEND_UPLOAD_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          content: reportText,
          role,
          companyType,
          solvedProblems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Upload failed");
      }

      console.log("✅ Uploaded Report URL:", data.publicUrl);

      const sessionId = location.state?.sessionId;

      if (sessionId) {
        await fetch(
          `http://localhost:5000/api/interview-session/complete/${sessionId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              reportUrl: data.publicUrl,
              messages: chatMessages,
              solvedProblems: solvedProblems,
              highlightClips: Object.values(highlightBufferRef.current),
            }),
          }
        );

        console.log("✅ Interview session updated with messages and solved problems");
      } else {
        console.warn("⚠️ No sessionId found. Interview not linked in DB.");
      }

      localStorage.setItem(
        "interviewReport",
        JSON.stringify({
          role,
          companyType,
          reportUrl: data.publicUrl,
          timestamp: new Date().toISOString(),
        })
      );

      setError("✅ Report saved! Redirecting to summary page...");

      setTimeout(() => {
        setError(null);
        navigate("/after-interview", { replace: true });
      }, 2500);
    } catch (err) {
      console.error("❌ Interview completion failed:", err);
      setError(`❌ Report upload failed: ${err.message}`);
    } finally {
      setIsLoadingAI(false);
    }
  }, [
    chatMessages,
    solvedProblems,
    companyType,
    role,
    isLoadingAI,
    isSpeaking,
    navigate,
    location,
  ]);

  useEffect(() => {
    if (isPreview) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setCameraAllowed(true);
        userVideoRef.current.srcObject = stream;
      } catch (err) {
        setError("Camera/Mic access denied.");
      }
    };

    startCamera();
  }, [isPreview]);

  useEffect(() => {
    if (cameraAllowed && companyType && role && !greeted) {
      const startAiConversation = async () => {
        try {
          const greetingPrompt = `
You are Jenny, the AI interviewer.

Your strict name is: "Jenny, your AI interviewer".
Never refer to yourself as anything else.

You are a friendly professional interviewer for a ${role} at a ${companyType}.
Start the mock interview. Greet the candidate professionally, mention the company type "${companyType}" and the role "${role}",
then begin with an appropriate first question (example: "Can you tell me about yourself?").
`;

          setIsLoadingAI(true);
          setChatMessages([]);

          const initialMessages = [
            { role: "user", content: "Start the interview introduction." },
          ];

          const aiQ = await fetchFireworksContent(initialMessages, greetingPrompt);

          const firstMsg = {
            sender: "AI",
            text: aiQ,
            time: new Date().toLocaleTimeString(),
          };
          setChatMessages([firstMsg]);
          await textToSpeech(aiQ);
          setGreeted(true);
        } catch (error) {
          console.error("Error sending initial greeting:", error);
          setError(error.message || "Failed to start AI conversation");
        } finally {
          setIsLoadingAI(false);
        }
      };
      startAiConversation();
    }
  }, [cameraAllowed, companyType, role, greeted, fetchFireworksContent, textToSpeech]);

  if (!cameraAllowed && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-[#1A1A1A] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Requesting camera and microphone permission...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] p-4 md:p-6 font-sans overflow-x-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none -z-50">
        <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-t from-pink-50 to-transparent rounded-full blur-[120px] opacity-60" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-[1800px] mx-auto bg-white/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 lg:p-10 border border-white/60 shadow-2xl shadow-gray-200/50 relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900">
              {companyType} - {role}
            </h1>
            <p className="text-gray-500 mt-2 font-medium">Live AI-powered mock interview</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEndInterview}
            className="flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 rounded-full font-bold hover:bg-gray-900 transition-colors shadow-lg"
          >
            <PhoneOff size={20} />
            End Interview
          </motion.button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Video & Controls */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Container */}
            <motion.div variants={itemUpVariants} className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-xl border border-gray-800">
              {isPreview ? (
                <div className="w-full h-[500px] bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                  <p className="text-gray-400">Video disabled in preview</p>
                </div>
              ) : (
                <video
                  ref={userVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-[480px] object-cover scale-x-[-1]"
                />
              )}

              {/* AI Speaking Indicator */}
              {isSpeaking && (
                <div className="absolute top-6 left-6 bg-gradient-to-r from-[#D4F478]/20 to-emerald-500/20 backdrop-blur-lg text-white px-4 py-2 rounded-full text-sm font-medium border border-[#D4F478]/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#D4F478] rounded-full animate-pulse"></div>
                    Jenny is speaking…
                  </div>
                </div>
              )}

              {/* Control Bar */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
                {/* Mic Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startSpeechRecognition}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl ${isRecording
                    ? "bg-gradient-to-br from-red-500 to-rose-600 text-white"
                    : "bg-gradient-to-br from-white to-gray-100 text-gray-900"
                    }`}
                >
                  <Mic size={22} />
                </motion.button>

                {/* Chat Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsChatOpen(true)}
                  className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-white to-gray-100 text-gray-900 shadow-2xl"
                >
                  <MessageSquare size={22} />
                </motion.button>

                {/* Code Editor Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCodeEditorOpen(true)}
                  className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-white to-gray-100 text-gray-900 shadow-2xl"
                >
                  <Code size={22} />
                </motion.button>

                {/* Solved Problems Button */}
                {solvedProblems.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSolvedProblems(true)}
                    className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-white to-gray-100 text-gray-900 shadow-2xl relative group"
                    title="View Solved Problems"
                  >
                    <ListChecks size={22} className="text-[#D4F478]" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4F478] text-black text-xs font-bold rounded-full flex items-center justify-center">
                      {solvedProblems.length}
                    </span>
                  </motion.button>
                )}
              </div>
            </motion.div>

          </div>

          {/* Right Column: AI Model & Chat */}
          <div className="space-y-8">
            {/* AI Model Container */}
            <motion.div variants={itemUpVariants} className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-2xl border border-gray-800 h-56">
              <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.6} />
                <Environment preset="studio" />
                <DynamicModel
                  speechText={currentAiSpeech}
                  onSpeechEnd={handleSpeechEnd}
                />
              </Canvas>

              <div className="absolute bottom-4 left-4 bg-gradient-to-r from-[#D4F478]/20 to-emerald-500/20 backdrop-blur-lg text-white px-4 py-2 rounded-full text-sm font-medium border border-[#D4F478]/30">
                <span className="font-bold">Ms. Jenny</span>
                <span className="text-[#D4F478] ml-2">• AI Interviewer</span>
              </div>
            </motion.div>

            {/* Chat Container */}
            <motion.div variants={itemUpVariants} whileHover={hoverCardEffect} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 shadow-lg h-[340px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Conversation</h3>
                {/* <div className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full text-xs font-bold text-gray-800">
                  {chatMessages.length} messages
                </div> */}
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                {chatMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === "User" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === "User"
                        ? "bg-gradient-to-r from-[#1A1A1A] to-gray-900 text-white rounded-br-none"
                        : "bg-gradient-to-r from-gray-100 to-white border border-gray-200 text-gray-900 rounded-bl-none"
                        }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {msg.sender === "User" ? "You" : "Jenny"}
                      </div>
                      <p className="text-sm">{msg.text}</p>
                      <div className="text-xs text-gray-500 mt-2">{msg.time}</div>
                      
                      {msg.sender === "User" && msg.feedback && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="text-xs font-bold text-[#D4F478] mb-1">Feedback</div>
                          <div className="text-xs text-gray-300">{msg.feedback.suggestion}</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isLoadingAI && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-gray-100 to-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#D4F478] rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-[#D4F478] rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-[#D4F478] rounded-full animate-pulse delay-300"></div>
                        <span className="text-sm text-gray-600 ml-2">Jenny is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && inputValue.trim()) {
                        handleSendMessage(inputValue);
                      }
                    }}
                    placeholder="Type your answer here..."
                    className="flex-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F478] focus:border-transparent"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || isLoadingAI || isSpeaking}
                    className="px-5 py-3 bg-gradient-to-r from-[#1A1A1A] to-gray-900 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </motion.button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Press Enter to send • Click mic icon for voice input
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Modals */}
      {isCodeEditorOpen && (
        <CodeEditorModal
          isOpen={isCodeEditorOpen}
          onClose={() => setIsCodeEditorOpen(false)}
          problem={codingProblem}
          onSuccess={async (userCode, testResults) => {
            setSolvedProblems((prev) => [
              ...prev,
              {
                problem: codingProblem,
                userCode,
                testResults,
                skipped: false,
                solvedAt: new Date().toISOString(),
              },
            ]);

            setIsCodeEditorOpen(false);
            setCodingCount((prev) => prev + 1);

            setTimeout(async () => {
              const nextCount = codingCount + 1;

              if (nextCount >= 3) {
                const msg = "Great work! That concludes the coding round. We will now move to the next round.";

                setChatMessages((prev) => [
                  ...prev,
                  {
                    sender: "AI",
                    text: msg,
                    time: new Date().toLocaleTimeString(),
                    stage: "post-coding",
                  },
                ]);

                textToSpeech(msg);
                setInterviewStage("final");
                return;
              }

              try {
                const { problem: nextProblem } = await fetchAndFormatCodingProblem();
                setCodingProblem(nextProblem);

                setChatMessages((prev) => [
                  ...prev,
                  {
                    sender: "AI",
                    text: "A new coding problem has been generated. Please open the Code Editor to solve it.",
                    time: new Date().toLocaleTimeString(),
                    stage: "coding",
                  },
                ]);

                setTimeout(() => setIsCodeEditorOpen(true), 500);
              } catch (err) {
                console.error(err);
                setError("Failed to fetch next coding problem.");
              }
            }, 300);
          }}
          onSkip={async () => {
            setSolvedProblems((prev) => [
              ...prev,
              {
                problem: codingProblem,
                userCode: null,
                testResults: null,
                skipped: true,
                solvedAt: new Date().toISOString(),
              },
            ]);

            setIsCodeEditorOpen(false);
            setCodingCount((prev) => prev + 1);

            setTimeout(async () => {
              const nextCount = codingCount + 1;

              if (nextCount >= 3) {
                const msg = "That concludes the coding round. Let's move to the next round.";

                setChatMessages((prev) => [
                  ...prev,
                  {
                    sender: "AI",
                    text: msg,
                    time: new Date().toLocaleTimeString(),
                    stage: "post-coding",
                  },
                ]);

                textToSpeech(msg);
                setInterviewStage("final");
                return;
              }

              try {
                const { problem: nextProblem } = await fetchAndFormatCodingProblem();
                setCodingProblem(nextProblem);

                setChatMessages((prev) => [
                  ...prev,
                  {
                    sender: "AI",
                    text: "A new coding problem has been generated. Please open the Code Editor to solve it.",
                    time: new Date().toLocaleTimeString(),
                    stage: "coding",
                  },
                ]);

                setTimeout(() => setIsCodeEditorOpen(true), 500);
              } catch (err) {
                console.error(err);
                setError("Failed to fetch next coding problem.");
              }
            }, 300);
          }}
        />
      )}

      {showSolvedProblems && (
        <SolvedProblemsModal
          isOpen={showSolvedProblems}
          onClose={() => setShowSolvedProblems(false)}
          problems={solvedProblems}
        />
      )}
    </div>
  );
};

export default InterviewScreen;




















// ---- actual correct working code ----

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { PhoneOff, MessageSquare, Code, Maximize, Minimize, X, Mic, ListChecks, Play, Code2, Terminal, CheckCircle2, XCircle } from "lucide-react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { Environment, useGLTF } from "@react-three/drei";
// import { useNavigate } from "react-router-dom";
// import Editor from "@monaco-editor/react";
// import { useLocation } from "react-router-dom";


// // --- Code Editor Modal Component (fixed + robust) ---
// const CodeEditorModal = ({ isOpen, onClose, problem, onSuccess, onSkip }) => {
//   const [language, setLanguage] = useState("javascript");
//   const [editorValue, setEditorValue] = useState("");
//   const [output, setOutput] = useState([]);
//   const [loading, setLoading] = useState(false);

//   if (!isOpen) return null;

//   /* -------------------- BOILERPLATE -------------------- */
//   const generateBoilerplate = (problemObj, lang) => {
//     if (!problemObj) return "";

//     const title = `// ${problemObj.title}\n`;
//     const desc =
//       problemObj.description
//         ?.split("\n")
//         .map((l) => `// ${l}`)
//         .join("\n") + "\n\n";

//     const fn = problemObj.functionName || "solve";

//     if (lang === "javascript") {
//       return `${title}${desc}function ${fn}(${problemObj.params || ""}) {\n  // TODO\n}\n`;
//     }

//     if (lang === "python") {
//       return `${title}${desc}def ${fn}(${problemObj.params || ""}):\n    pass\n`;
//     }

//     if (lang === "cpp") {
//       return `${title}${desc}#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  return 0;\n}`;
//     }

//     return "";
//   };

//   /* -------------------- SYNC EDITOR WITH PROBLEM -------------------- */
//   useEffect(() => {
//     if (!problem) return;

//     const val = generateBoilerplate(problem, language);
//     setEditorValue(val);
//   }, [problem, language]);

//   /* -------------------- RUN CODE -------------------- */
//   const handleRun = async () => {
//     if (!editorValue || !problem?.testCases) {
//       setOutput([{ id: 0, output: "No test cases available." }]);
//       return;
//     }

//     setLoading(true);
//     setOutput([{ id: 0, output: "Running test cases..." }]);

//     try {
//       const results = [];
//       let allPassed = true;

//       for (let i = 0; i < problem.testCases.length; i++) {
//         const t = problem.testCases[i];

//         const runner =
//           language === "python"
//             ? `\nprint(${problem.functionName}(${t.input}))`
//             : language === "cpp"
//               ? `\n#include <iostream>\nint main(){ std::cout << ${problem.functionName}(${t.input}); }`
//               : `\nconsole.log(${problem.functionName}(${t.input}));`;

//         const res = await fetch("http://localhost:5000/run", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             language,
//             code: editorValue + runner,
//           }),
//         });

//         const data = await res.json();
//         const out =
//           data.run?.output?.trim() ||
//           data.run?.stderr?.trim() ||
//           "No output";

//         const passed = out === String(t.expected).trim();
//         if (!passed) allPassed = false;

//         results.push({
//           id: i + 1,
//           input: t.input,
//           expected: t.expected,
//           output: out,
//           passed,
//         });
//       }

//       setOutput(results);

//       if (allPassed) {
//         setTimeout(() => {
//           onSuccess(editorValue, results);
//         }, 600);
//       }
//     } catch {
//       setOutput([{ id: 0, output: "Execution failed. Backend error." }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* -------------------- UI -------------------- */
//   return (
//     <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
//       <div className="w-full max-w-7xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white relative flex">

//         {/* LEFT PANEL */}
//         <aside className="w-[360px] bg-gradient-to-b from-slate-900 to-slate-800 border-r border-white/10 p-6 overflow-y-auto">
//           <h2 className="text-2xl font-semibold text-emerald-400 mb-3">
//             {problem?.title || "Waiting..."}
//           </h2>

//           <p className="text-sm text-gray-300 leading-relaxed mb-6">
//             {problem?.description}
//           </p>

//           <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-3">
//             Test Cases
//           </h3>

//           <div className="space-y-3">
//             {problem?.testCases?.map((t, i) => (
//               <div
//                 key={i}
//                 className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm"
//               >
//                 <div>
//                   <span className="text-gray-400">Input:</span> {t.input}
//                 </div>
//                 <div>
//                   <span className="text-gray-400">Expected:</span> {t.expected}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </aside>

//         {/* MAIN */}
//         <section className="flex-1 flex flex-col">

//           {/* TOP BAR */}
//           <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-white/10">
//             <select
//               value={language}
//               onChange={(e) => setLanguage(e.target.value)}
//               className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1 text-sm"
//             >
//               <option value="javascript">JavaScript</option>
//               <option value="python">Python</option>
//               <option value="cpp">C++</option>
//             </select>

//             <div className="flex items-center gap-3">
//               <button
//                 onClick={handleRun}
//                 disabled={loading}
//                 className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-white/10 text-sm font-medium text-emerald-400 transition"
//               >
//                 <Play className="w-4 h-4" />
//                 Run
//               </button>

//               <button
//                 onClick={() => onSkip(editorValue)}
//                 className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-white/10 text-sm font-medium text-red-400 transition"
//               >
//                 Skip
//               </button>

//               <button
//                 onClick={onClose}
//                 className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-white/10 text-gray-300"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//           </header>

//           {/* EDITOR */}
//           <div className="px-6 py-4">
//             <div className="h-[45vh] bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden shadow-inner">
//               <Editor
//                 height="100%"
//                 theme="vs-dark"
//                 language={language === "cpp" ? "cpp" : language}
//                 value={editorValue}
//                 onChange={(val) => setEditorValue(val || "")}
//                 options={{
//                   fontSize: 15,
//                   minimap: { enabled: false },
//                   automaticLayout: true,
//                 }}
//               />
//             </div>
//           </div>

//           {/* OUTPUT */}
//           <div className="px-6 pb-5">
//             <div className="bg-[#0b1220] border border-cyan-500/20 rounded-xl p-4">
//               <h3 className="text-cyan-400 font-semibold mb-3 tracking-wide">
//                 ▸ Execution Results
//               </h3>

//               {output.map((r, i) => (
//                 <div
//                   key={i}
//                   className={`rounded-lg px-4 py-3 text-sm mb-2 ${
//                     r.id === 0
//                       ? "bg-slate-800 border border-white/10"
//                       : r.passed
//                         ? "bg-emerald-500/10 border border-emerald-500/30"
//                         : "bg-red-500/10 border border-red-500/30"
//                   }`}
//                 >
//                   {r.id !== 0 ? (
//                     <>
//                       <div className="font-medium mb-1">
//                         Test {r.id} —{" "}
//                         <span
//                           className={
//                             r.passed ? "text-emerald-400" : "text-red-400"
//                           }
//                         >
//                           {r.passed ? "Passed" : "Failed"}
//                         </span>
//                       </div>
//                       <div className="text-gray-300">
//                         Output: {r.output}
//                       </div>
//                     </>
//                   ) : (
//                     r.output
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

// const SolvedProblemsModal = ({ isOpen, onClose, problems }) => {
//   const [selected, setSelected] = useState(null);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
//       <div className="w-full max-w-6xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white relative">

//         {/* SIDEBAR */}
//         <aside className="w-[340px] bg-gradient-to-b from-slate-900 to-slate-800 border-r border-white/10 p-5 overflow-y-auto">
//           <h2 className="text-lg font-semibold text-emerald-400 mb-4">
//             Solved Problems
//           </h2>

//           {problems.length === 0 && (
//             <p className="text-sm text-gray-400">
//               No problems solved yet.
//             </p>
//           )}

//           <div className="space-y-2">
//             {problems.map((p, i) => {
//               const active = selected === p;
//               return (
//                 <button
//                   key={i}
//                   onClick={() => setSelected(p)}
//                   className={`w-full text-left px-4 py-3 rounded-lg border transition
//                     ${
//                       active
//                         ? "bg-white/10 border-emerald-500/40"
//                         : "bg-white/5 hover:bg-white/10 border-white/10"
//                     }`}
//                 >
//                   <div className="font-medium text-sm">
//                     {p.problem.title}
//                   </div>
//                   <div className="text-xs text-gray-400 mt-1">
//                     {new Date(p.solvedAt).toLocaleString()}
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         </aside>

//         {/* MAIN CONTENT */}
//         <section className="flex-1 p-6 overflow-y-auto">
//           {!selected && (
//             <div className="h-full flex items-center justify-center text-gray-400">
//               Select a solved problem to view details
//             </div>
//           )}

//           {selected && (
//             <div className="max-w-4xl">
//               {/* HEADER */}
//               <div className="mb-6">
//                 <h2 className="text-2xl font-semibold text-emerald-400 mb-2">
//                   {selected.problem.title}
//                 </h2>

//                 {selected.skipped && (
//                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
//                     <XCircle className="w-4 h-4" />
//                     Skipped
//                   </div>
//                 )}
//               </div>

//               {/* DESCRIPTION */}
//               <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
//                 <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
//                   Problem Description
//                 </h3>
//                 <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
//                   {selected.problem.description}
//                 </p>
//               </div>

//               {/* SOLUTION */}
//               <div className="mb-8">
//                 <h3 className="flex items-center gap-2 text-lg font-semibold text-cyan-400 mb-3">
//                   <Code2 className="w-5 h-5" />
//                   Your Solution
//                 </h3>

//                 {selected.skipped ? (
//                   <p className="text-sm text-gray-400 italic">
//                     No code submitted for this problem.
//                   </p>
//                 ) : (
//                   <div className="h-[280px] bg-[#1e1e1e] border border-white/10 rounded-xl overflow-hidden shadow-inner">
//                     <Editor
//                       height="100%"
//                       language="javascript"
//                       value={selected.userCode || "// No code submitted"}
//                       theme="vs-dark"
//                       options={{
//                         readOnly: true,
//                         minimap: { enabled: false },
//                         fontSize: 15,
//                         scrollBeyondLastLine: false,
//                         automaticLayout: true,
//                       }}
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* TEST RESULTS */}
//               <div>
//                 <h3 className="text-lg font-semibold text-yellow-400 mb-3">
//                   Test Case Results
//                 </h3>

//                 {selected.skipped ? (
//                   <p className="text-sm text-gray-400 italic">
//                     No test results available.
//                   </p>
//                 ) : (
//                   <div className="space-y-3">
//                     {selected.testResults.map((r, idx) => (
//                       <div
//                         key={idx}
//                         className={`rounded-lg px-4 py-3 border text-sm
//                           ${
//                             r.passed
//                               ? "bg-emerald-500/10 border-emerald-500/30"
//                               : "bg-red-500/10 border-red-500/30"
//                           }`}
//                       >
//                         <div className="flex items-center justify-between mb-1">
//                           <span className="font-medium">
//                             Test Case {idx + 1}
//                           </span>
//                           <span
//                             className={`flex items-center gap-1 text-sm
//                               ${
//                                 r.passed
//                                   ? "text-emerald-400"
//                                   : "text-red-400"
//                               }`}
//                           >
//                             {r.passed ? (
//                               <>
//                                 <CheckCircle2 className="w-4 h-4" /> Passed
//                               </>
//                             ) : (
//                               <>
//                                 <XCircle className="w-4 h-4" /> Failed
//                               </>
//                             )}
//                           </span>
//                         </div>

//                         <div className="text-gray-300">
//                           <div>
//                             <span className="text-gray-400">Input:</span>{" "}
//                             {r.input}
//                           </div>
//                           <div>
//                             <span className="text-gray-400">Expected:</span>{" "}
//                             {r.expected}
//                           </div>
//                           <div>
//                             <span className="text-gray-400">Output:</span>{" "}
//                             {r.output}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </section>

//         {/* CLOSE */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 p-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-white/10"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>
//     </div>
//   );
// };

// // --- Enhanced Model Component with Dynamic Speech ---
// function DynamicModel({ speechText, onSpeechEnd, ...props }) {
//   const { nodes, materials } = useGLTF('/final_prepvio_model.glb');
//   const meshRef = useRef();
//   const headBoneRef = useRef(null);
//   const intervalRef = useRef(null);

//   useEffect(() => {
//     Object.values(materials || {}).forEach((mat) => (mat.morphTargets = true));
//   }, [materials]);

//   const letterToViseme = {
//     a: 'aa', b: 'PP', c: 'CH', d: 'DD', e: 'E', f: 'FF',
//     g: 'DD', h: 'sil', i: 'E', k: 'DD', l: 'nn', m: 'PP',
//     n: 'nn', o: 'oh', p: 'PP', r: 'aa', s: 'SS', t: 'DD',
//     u: 'oh', v: 'FF', w: 'oh', x: 'SS', y: 'E', z: 'SS',
//     ' ': 'sil'
//   };

//   const [currentCharIndex, setCurrentCharIndex] = useState(0);
//   const [chars, setChars] = useState([]);
//   const morphKeys = nodes?.rp_carla_rigged_001_geo?.morphTargetDictionary || {};

//   useEffect(() => {
//     if (!speechText) {
//       setChars([]);
//       setCurrentCharIndex(0);
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//       return;
//     }

//     window.speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(speechText);
//     utterance.rate = 1.2;

//     // --- FEMALE VOICE SELECTION ---
//     let voices = window.speechSynthesis.getVoices();

//     const setFemaleVoice = () => {
//       voices = window.speechSynthesis.getVoices();
//       const femaleVoice =
//         voices.find(v => v.name.toLowerCase().includes("female")) ||
//         voices.find(v => v.name.toLowerCase().includes("woman")) ||
//         voices.find(v => v.name.toLowerCase().includes("samantha")) || // iOS/macOS
//         voices.find(v => v.name.toLowerCase().includes("zira")) ||     // Windows
//         voices.find(v => v.name.toLowerCase().includes("google us")) ||// Chrome
//         voices[0];

//       utterance.voice = femaleVoice;
//     };

//     if (voices.length === 0) {
//       window.speechSynthesis.onvoiceschanged = setFemaleVoice;
//     } else {
//       setFemaleVoice();
//     }

//     utterance.onend = () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//       setCurrentCharIndex(0);
//       if (onSpeechEnd) onSpeechEnd();
//     };

//     utterance.onerror = () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//       if (onSpeechEnd) onSpeechEnd();
//     };

//     // --- SPEAK WITH FEMALE VOICE ---
//     window.speechSynthesis.speak(utterance);

//     const textChars = speechText.toLowerCase().split('');
//     setChars(textChars);

//     let i = 0;
//     intervalRef.current = setInterval(() => {
//       if (i < textChars.length) {
//         setCurrentCharIndex(i);
//         i++;
//       } else {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     }, 150);

//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     };
//   }, [speechText, onSpeechEnd]);


//   useEffect(() => {
//     if (nodes?.rp_carla_rigged_001_geo?.skeleton) {
//       const head = nodes.rp_carla_rigged_001_geo.skeleton.bones.find((b) =>
//         b.name.toLowerCase().includes('head')
//       );
//       if (head) headBoneRef.current = head;
//     }
//   }, [nodes]);

//   const offsetY = useRef(Math.random() * 0.08);
//   const offsetX = useRef(Math.random() * 0.05);

//   useFrame((state) => {
//     const t = state.clock.getElapsedTime();

//     if (headBoneRef.current) {
//       headBoneRef.current.rotation.y = Math.sin(t * 0.4 + offsetY.current) * 0.02;
//       headBoneRef.current.rotation.x = Math.sin(t * 0.3 + offsetX.current) * 0.04;
//     }

//     if (meshRef.current?.morphTargetInfluences && chars.length > 0) {
//       const influences = meshRef.current.morphTargetInfluences;
//       influences.fill(0);

//       const char = chars[currentCharIndex];
//       if (char) {
//         const viseme = letterToViseme[char] || 'oh';
//         const index = morphKeys[viseme];
//         if (index !== undefined) influences[index] = 0.8;
//       }
//     }
//   });

//   if (!nodes?.rp_carla_rigged_001_geo) return null;

//   return (
//     <group
//       {...props}
//       position={[-0.48, -1.3, 3.967]}
//       rotation={[1.9, 0, 0]}
//       scale={0.01}
//       dispose={null}
//     >
//       <skinnedMesh
//         ref={meshRef}
//         geometry={nodes.rp_carla_rigged_001_geo.geometry}
//         material={nodes.rp_carla_rigged_001_geo.material}
//         skeleton={nodes.rp_carla_rigged_001_geo.skeleton}
//         morphTargetInfluences={nodes.rp_carla_rigged_001_geo.morphTargetInfluences || []}
//         morphTargetDictionary={nodes.rp_carla_rigged_001_geo.morphTargetDictionary || {}}
//       />
//       <primitive object={nodes.root} />
//     </group>
//   );
// }

// useGLTF.preload('/final_prepvio_model.glb');

// // --- API Constants ---
// const FIREWORKS_API_URL = "https://api.fireworks.ai/inference/v1/chat/completions";
// const BACKEND_UPLOAD_URL = "/api/upload";
// const apiKey = "fw_3ZbHnsRsTg9cHxxESpgxzMim";

// // --- Utilities: format problem for chat (keeps chat+editor in sync) ---
// const generateReportContent = (messages, company, role) => {
//   let content = `--- Mock Interview Report ---\n\n`;
//   content += `Role: ${role}\n`;
//   content += `Company Type: ${company}\n`;
//   content += `Date: ${new Date().toLocaleDateString()}\n\n`;
//   content += `--- Conversation Log ---\n\n`;

//   messages.forEach((msg) => {
//     content += `${msg.sender}: ${msg.text}\n`;

//     if (msg.sender === "User" && msg.feedback) {
//       const suggestion = msg.feedback.suggestion || "";
//       const example = msg.feedback.example || "";
//       content += `[Feedback]: ${suggestion}|||${example}\n`;
//     }
//   });

//   content += `\n=== FINAL ANALYSIS ===\n\n`;
//   content += `**Overall Performance Summary**\n`;
//   content += `This interview covered both HR and technical aspects for the ${role} position.\n\n`;

//   content += `**Key Strengths Observed**\n`;
//   content += `- Engaged actively throughout the conversation\n`;
//   content += `- Demonstrated willingness to learn and improve\n\n`;

//   content += `**General Recommendations**\n`;
//   content += `1. Continue practicing technical concepts relevant to ${role}\n`;
//   content += `2. Use the STAR method for behavioral questions\n`;
//   content += `3. Build small projects to demonstrate practical skills\n`;
//   content += `4. Review feedback provided after each response above\n`;

//   return content;
// };

// // --- Main InterviewScreen (fixed) ---
// const InterviewScreen = ({
//   companyType = "Tech Startup",
//   role = "Full Stack Developer",
//   setStage = () => { },
//   userId = "user1"
// }) => {
//   const userVideoRef = useRef(null);
//   const screenRef = useRef(null);
//   const chatEndRef = useRef(null);
//   const recognitionRef = useRef(null);
//   const speechBufferRef = useRef("");
//   const location = useLocation();
//   const highlightBufferRef = useRef([]);

//   const isPreview = location.state?.isPreview === true;
//   const previewSession = location.state?.previewSession;
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [currentQuestionText, setCurrentQuestionText] = useState("");






//   const [isFullScreen, setIsFullScreen] = useState(false);
//   const [cameraAllowed, setCameraAllowed] = useState(false);
//   const [isChatOpen, setIsChatOpen] = useState(false);
//   const [chatMessages, setChatMessages] = useState([]);
//   const [inputValue, setInputValue] = useState("");
//   const [isLoadingAI, setIsLoadingAI] = useState(false);
//   const [greeted, setGreeted] = useState(false);
//   const [error, setError] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [interviewStage, setInterviewStage] = useState("intro");
//   const [currentAiSpeech, setCurrentAiSpeech] = useState("");
//   const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
//   const [codingProblem, setCodingProblem] = useState(null);
//   const [solvedProblems, setSolvedProblems] = useState([]);
//   const [showSolvedProblems, setShowSolvedProblems] = useState(false);
//   const [deviationWarnings, setDeviationWarnings] = useState(0);
//   const FRAME_INTERVAL = 1000; // 1 frame per second


//   const captureFrame = () => {
//   const video = userVideoRef.current;

//   if (
//     !video ||
//     video.readyState < 2 ||        // ❗ video not ready
//     video.videoWidth === 0 ||
//     video.videoHeight === 0
//   ) {
//     return null;
//   }

//   const canvas = document.createElement("canvas");
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;

//   const ctx = canvas.getContext("2d");
//   ctx.drawImage(video, 0, 0);

//   return canvas.toDataURL("image/jpeg", 0.6);
// };




//   // NEW: track how many coding problems attempted in this coding round
//   const [codingCount, setCodingCount] = useState(0);

//   const navigate = useNavigate();

//   const endInterview = useCallback(() => {
//     console.log("Interview ended and resources cleaned.");
//     if (window.speechSynthesis) window.speechSynthesis.cancel();
//     if (window.currentMediaStream) {
//       window.currentMediaStream.getTracks().forEach(track => track.stop());
//       window.currentMediaStream = null;
//     }
//     if (userVideoRef.current?.srcObject) {
//       userVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
//       userVideoRef.current.srcObject = null;
//     }
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//       recognitionRef.current = null;
//     }
//     setIsSpeaking(false);
//     setIsRecording(false);
//     setGreeted(false);
//     setChatMessages([]);
//     setError(null);
//     console.log("✅ All media and states cleared.");
//   }, []);

//   useEffect(() => {
//     const handleBeforeUnload = () => {
//       sessionStorage.setItem("refreshFlag", "true");
//     };
//     window.addEventListener("beforeunload", handleBeforeUnload);

//     if (sessionStorage.getItem("refreshFlag") === "true") {
//       sessionStorage.removeItem("refreshFlag");
//       endInterview();
//       navigate("/", { replace: true });
//     }

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, [navigate, endInterview]);

//   useEffect(() => {
//     if (isPreview && previewSession?.messages) {
//       setChatMessages(previewSession.messages);
//       setSolvedProblems(previewSession.solvedProblems || []);
//       setCameraAllowed(true); // bypass loader screen
//     }
//   }, [isPreview, previewSession]);


//   // Add this hook in your InterviewScreen component
//   // Replace the existing useEffect for frame capture

//   // Replace your frame capture useEffect with this debugged version

//   // Add this updated useEffect for frame capture in InterviewScreen.jsx
// // Replace the existing frame capture useEffect with this version

// // Add this updated useEffect for frame capture in InterviewScreen.jsx
// // Replace the existing frame capture useEffect with this version

// useEffect(() => {
//   const sessionId = location.state?.sessionId;

//   if (!sessionId) {
//     console.warn("⚠️ No sessionId found - nervousness detection disabled");
//     return;
//   }

//   console.log("📹 Starting nervousness detection for session:", sessionId);

//   let frameCount = 0;
//   let successCount = 0;
//   let errorCount = 0;

//   const interval = setInterval(() => {
//     frameCount++;

//     const frame = captureFrame();

//     if (!frame) {
//       console.warn(`⚠️ Frame ${frameCount}: Capture returned null`);
//       return;
//     }

//     // Log first frame details for debugging
//     if (frameCount === 1) {
//       console.log("📸 First frame captured:", {
//         length: frame.length,
//         prefix: frame.substring(0, 30) + "..."
//       });
//     }

//     fetch("http://127.0.0.1:5050/analyze-frame", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         sessionId: sessionId,
//         frame: frame,
//         questionIndex: currentQuestionIndex  // ✅ Send current question
//       })
//     })
//       .then(res => {
//         if (!res.ok) {
//           throw new Error(`HTTP ${res.status}: ${res.statusText}`);
//         }
//         return res.json();
//       })
//       .then(data => {
//         successCount++;

//         // ✅ NEW: Store highlight with Cloudinary URL
//         if (
//           data.nervous &&
//           data.imageUrl  // ✅ Check for Cloudinary URL
//         ) {
//           const existing = highlightBufferRef.current[currentQuestionIndex];

//           // Only update if this is a higher score
//           if (data.nervous && data.imageUrl) {
//   highlightBufferRef.current.push({
//     questionIndex: currentQuestionIndex,
//     questionText: currentQuestionText,
//     nervousScore: data.score,
//     confidence: data.confidence,
//     imageUrl: data.imageUrl,
//     timestamp: new Date().toLocaleTimeString(),
//     capturedAt: new Date(),
//   });

//   console.log(
//     `🟡 Highlight appended for Q${currentQuestionIndex}`,
//     data.imageUrl
//   );
// }

//         }
//       })
//       .catch(err => {
//         errorCount++;
//         console.error(`❌ Frame ${frameCount} failed:`, err.message);

//         // Log stats every 10 errors
//         if (errorCount % 10 === 0) {
//           console.warn(`📊 Stats: ${successCount} success, ${errorCount} errors out of ${frameCount} frames`);
//         }
//       });
//   }, 1000); // Every 1 second (faster detection)

//   return () => {
//     clearInterval(interval);
//     console.log(`📹 Detection stopped. Final stats: ${successCount} success, ${errorCount} errors out of ${frameCount} frames`);
    
//     // ✅ Cleanup session data on unmount
//     fetch("http://127.0.0.1:5050/cleanup-session", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ sessionId })
//     }).catch(err => console.error("Cleanup failed:", err));
//   };
// }, [location.state?.sessionId, currentQuestionIndex, currentQuestionText]);


//   useEffect(() => {
//     window.history.pushState(null, "", window.location.pathname);

//     const handlePopState = (e) => {
//       console.log("⬅️ User navigated back — ending interview and blocking forward navigation");

//       window.history.pushState(null, "", window.location.pathname);

//       if (window.speechSynthesis) {
//         window.speechSynthesis.cancel();
//       }
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//         recognitionRef.current = null;
//       }
//       if (userVideoRef.current?.srcObject) {
//         userVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
//         userVideoRef.current.srcObject = null;
//       }
//       if (window.currentMediaStream) {
//         window.currentMediaStream.getTracks().forEach(track => track.stop());
//         window.currentMediaStream = null;
//       }

//       navigate("/", { replace: true });
//     };

//     window.addEventListener("popstate", handlePopState);

//     return () => {
//       window.removeEventListener("popstate", handlePopState);
//     };
//   }, [navigate]);

//   useEffect(() => {
//     return () => {
//       endInterview();
//     };
//   }, [endInterview]);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chatMessages]);

//   const formatHistoryForFireworks = useCallback((history) => {
//     return history.map((msg) => ({
//       role: msg.sender === "AI" ? "assistant" : "user",
//       content: msg.text,
//     }));
//   }, []);

//   const fetchFireworksContent = useCallback(async (messages, systemInstruction) => {
//     const messagesWithSystem = [
//       { role: "system", content: systemInstruction },
//       ...messages
//     ];

//     try {
//       const res = await fetch(FIREWORKS_API_URL, {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${apiKey}`,
//           "Content-Type": "application/json",
//           "Accept": "application/json"
//         },
//         body: JSON.stringify({
//           model: "accounts/fireworks/models/deepseek-v3p1",
//           messages: messagesWithSystem
//         })
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         console.error("API Error:", errorText);
//         throw new Error(`API error: ${res.status}`);
//       }

//       const data = await res.json();
//       return data?.choices?.[0]?.message?.content || "No response";
//     } catch (err) {
//       console.error("Fireworks API Error:", err);
//       throw err;
//     }
//   }, []);

//   const generateFeedbackForAnswer = useCallback(async (userAnswer, aiQuestion) => {
//     try {
//       const feedbackPrompt = `You are an interview coach analyzing a candidate's answer.

// Previous Question: "${aiQuestion}"
// Candidate's Answer: "${userAnswer}"

// Provide constructive feedback in this EXACT format (no additional text):
// SUGGESTION: [One specific improvement suggestion in 1-2 sentences]
// EXAMPLE: [A better way to phrase the answer in 1 sentence]

// Keep it concise and actionable.`;

//       const feedbackMessages = [
//         { role: "user", content: feedbackPrompt }
//       ];

//       const feedbackText = await fetchFireworksContent(feedbackMessages, "You are a helpful interview coach providing brief, actionable feedback.");

//       const suggestionMatch = feedbackText.match(/SUGGESTION:\s*(.+?)(?=EXAMPLE:|$)/s);
//       const exampleMatch = feedbackText.match(/EXAMPLE:\s*(.+?)$/s);

//       return {
//         suggestion: suggestionMatch ? suggestionMatch[1].trim() : "Keep practicing to improve your interview responses.",
//         example: exampleMatch ? exampleMatch[1].trim() : ""
//       };
//     } catch (err) {
//       console.error("Feedback generation error:", err);
//       return {
//         suggestion: "Consider providing more specific examples from your experience.",
//         example: "Try structuring your answer with concrete details about what you did and what you achieved."
//       };
//     }
//   }, [fetchFireworksContent]);

//   // --- STEP 1: Centralized Coding Problem Generator (used to fetch exactly one canonical problem) ---
//   const fetchAndFormatCodingProblem = useCallback(async () => {
//     try {
//       const response = await fetch("http://localhost:5000/api/interview/fireworks", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({})
//       });

//       if (!response.ok) {
//         throw new Error("Failed to generate coding problem");
//       }

//       const data = await response.json();

//       // CASE 1: Backend gives clean JSON
//       if (data.title && data.description && data.testCases) {
//         return {
//           problem: data,
//           questionText: formatProblemForChat(data)
//         };
//       }

//       // CASE 2: Backend gives wrapped JSON text inside Fireworks format
//       const raw = data?.choices?.[0]?.message?.content?.trim() || "";
//       let clean = raw.replace(/```json|```/g, "");
//       const objMatch = clean.match(/\{[\s\S]*\}/);

//       if (!objMatch) {
//         const fallback = {
//           title: "Coding Challenge",
//           description: raw,
//           example: "",
//           testCases: []
//         };
//         return {
//           problem: fallback,
//           questionText: formatProblemForChat(fallback)
//         };
//       }

//       const parsed = JSON.parse(objMatch[0]);
//       return {
//         problem: parsed,
//         questionText: formatProblemForChat(parsed)
//       };

//     } catch (err) {
//       console.error("Coding problem fetch error:", err);
//       throw err;
//     }
//   }, []);

//   // --- Formats problem into readable chat message ---
//   const formatProblemForChat = useCallback((problem) => {
//     const title = problem.title || "Coding Challenge";
//     const desc = problem.description || "";
//     const example = problem.example ? `Example:\n${problem.example}` : "";
//     const tests = problem.testCases?.length
//       ? "\nTest Cases:\n" +
//       problem.testCases.map(
//         (tc, i) => `${i + 1}. Input: ${tc.input} → Expected: ${tc.expected}`
//       ).join("\n")
//       : "";

//     return `${title}\n\n${desc}\n\n${example}${tests}\n\nYou can use the Code Editor to solve this problem.`;
//   }, []);

//   const handleSpeechEnd = useCallback(() => {
//     setIsSpeaking(false);
//     setCurrentAiSpeech("");
//     setTimeout(() => startSpeechRecognition(), 500);
//   }, []);

//   const textToSpeech = useCallback((text) => {
//     if (!text) return;
//     setIsSpeaking(true);
//     setCurrentAiSpeech(text);
//   }, []);

//   // Remove any earlier "generateCodingProblem" that auto-opens editor.
//   // The editor will now be opened only when AI asks a coding question and we fetch one canonical problem.

//   const handleSendMessage = useCallback(
//     async (text) => {
//       const messageToSend = text.trim();
//       if (!messageToSend || isLoadingAI || isSpeaking) return;

//       // Stop speech recognition
//       if (recognitionRef.current) {
//         recognitionRef.current.stop();
//         recognitionRef.current = null;
//         setIsRecording(false);
//       }

//       setError(null);
//       setInputValue("");

//       const lastAiMessage =
//         chatMessages.filter((m) => m.sender === "AI").slice(-1)[0];
//       const lastAiQuestion = lastAiMessage ? lastAiMessage.text : "";

//       const userMsg = {
//         sender: "User",
//         text: messageToSend,
//         time: new Date().toLocaleTimeString(),
//         stage: interviewStage,
//         feedback: null,
//       };

//       setChatMessages((prev) => [...prev, userMsg]);

//       // -----------------------------------------
//       // COUNT QUESTIONS PER STAGE
//       // -----------------------------------------
//       const aiCount = (stage) =>
//         chatMessages.filter(
//           (m) => m.sender === "AI" && m.stage === stage
//         ).length;

//       const introQ = aiCount("intro");
//       const transQ = aiCount("transition");
//       const techQ = aiCount("technical");

//       // -----------------------------------------
//       // STAGE TRANSITIONS (NO DEADLOCKS)
//       // -----------------------------------------

//       // INTRO → TRANSITION
//       if (interviewStage === "intro" && introQ >= 2) {
//         const msg =
//           "Great. Let’s move forward. I’ll now ask you a few pre-technical questions.";
//         setInterviewStage("transition");
//         setIsLoadingAI(false);

//         setChatMessages((prev) => [
//           ...prev,
//           {
//             sender: "AI",
//             text: msg,
//             time: new Date().toLocaleTimeString(),
//             stage: "transition",
//           },
//         ]);

//         textToSpeech(msg);
//         return;
//       }

//       // TRANSITION → TECHNICAL
//       if (interviewStage === "transition" && transQ >= 1) {
//         const msg =
//           "Now let’s begin the technical round. I’ll ask you concept-based questions.";
//         setInterviewStage("technical");
//         setIsLoadingAI(false);

//         setChatMessages((prev) => [
//           ...prev,
//           {
//             sender: "AI",
//             text: msg,
//             time: new Date().toLocaleTimeString(),
//             stage: "technical",
//           },
//         ]);

//         textToSpeech(msg);
//         return;
//       }

//       // TECHNICAL → CODING
//       if (interviewStage === "technical" && techQ >= 4) {
//         const msg =
//           "That concludes the technical round. We will now move to the coding round.";

//         setChatMessages((prev) => [
//           ...prev,
//           {
//             sender: "AI",
//             text: msg,
//             time: new Date().toLocaleTimeString(),
//             stage: "technical",
//           },
//         ]);

//         textToSpeech(msg);

//         setTimeout(async () => {
//           setInterviewStage("coding");
//           try {
//             const { problem } = await fetchAndFormatCodingProblem();
//             setCodingProblem(problem);

//             setChatMessages((prev) => [
//               ...prev,
//               {
//                 sender: "AI",
//                 text: "Your first coding problem is ready. Please open the Code Editor.",
//                 time: new Date().toLocaleTimeString(),
//                 stage: "coding",
//               },
//             ]);

//             setTimeout(() => setIsCodeEditorOpen(true), 600);
//           } catch (err) {
//             setError("Failed to generate coding problem.");
//           }
//         }, 1000);

//         return;
//       }

//       // -----------------------------------------
//       // NORMAL AI QUESTION FLOW
//       // -----------------------------------------
//       setIsLoadingAI(true);

//       try {
//         let systemInstruction = "";

//         if (interviewStage === "intro")
//           systemInstruction = `
// You are an AI interviewer in the INTRO round.

// RULES:
// - Ask ONLY ONE question.
// - Question length MUST be between 20 and 25 words.
// - Ask an introductory HR question.
// - Do NOT add explanations, examples, or follow-ups.
// `;

//         else if (interviewStage === "transition")
//           systemInstruction = `
// You are an AI interviewer in the TRANSITION round.

// RULES:
// - Ask ONLY ONE light technical or conceptual question.
// - Question length MUST be between 20 and 25 words.
// - No coding questions.
// - No explanations or follow-ups.
// `;

//         else if (interviewStage === "technical")
//           systemInstruction = `
// You are an AI interviewer in the TECHNICAL round.

// RULES:
// - Ask ONLY ONE theory-based technical question.
// - Question length MUST be between 20 and 25 words.
// - No coding problems.
// - No multi-part questions.
// `;

//         else if (interviewStage === "coding")
//           systemInstruction = `
// You are in the CODING round.
// Do NOT ask questions. Wait for the user to solve the problem.
// `;

//         else if (interviewStage === "final")
//           systemInstruction = `
// You are an AI interviewer in the FINAL round.

// RULES:
// - Ask ONLY ONE wrap-up HR question.
// - Question length MUST be between 20 and 25 words.
// - Be concise and professional.
// `;

//         const formattedHistory = formatHistoryForFireworks([
//           ...chatMessages,
//           userMsg,
//         ]);

//         const aiReplyRaw = await fetchFireworksContent(
//           formattedHistory,
//           systemInstruction
//         );

//         // 🔒 HARD SAFETY: trim to max 25 words
//         const aiReply = aiReplyRaw
//           .split(" ")
//           .slice(0, 25)
//           .join(" ");

//         // ✅ TRACK CURRENT QUESTION
//         setCurrentQuestionIndex(prev => prev + 1);
//         setCurrentQuestionText(aiReply);


//         const feedback = await generateFeedbackForAnswer(
//           messageToSend,
//           lastAiQuestion
//         );

//         setChatMessages((prev) => {
//           const updated = [...prev];
//           const idx = updated.map((m) => m.sender).lastIndexOf("User");
//           if (idx !== -1) updated[idx].feedback = feedback;
//           return updated;
//         });

//         setChatMessages((prev) => [
//           ...prev,
//           {
//             sender: "AI",
//             text: aiReply,
//             time: new Date().toLocaleTimeString(),
//             stage: interviewStage,
//           },
//         ]);

//         textToSpeech(aiReply);
//       }
//       catch (err) {
//         console.error("AI Error:", err);
//         setError("AI failed to respond.");
//       } finally {
//         setIsLoadingAI(false);
//       }
//     },
//     [
//       isLoadingAI,
//       isSpeaking,
//       chatMessages,
//       interviewStage,
//       formatHistoryForFireworks,
//       fetchFireworksContent,
//       generateFeedbackForAnswer,
//       fetchAndFormatCodingProblem,
//       textToSpeech,
//     ]
//   );



//   const startSpeechRecognition = useCallback(() => {
//     if (isLoadingAI || isSpeaking) return;

//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       setError("Speech Recognition not supported in this browser.");
//       return;
//     }

//     // NEW: buffer to store spoken text reliably
//     const speechBufferRefLocal = speechBufferRef;
//     speechBufferRefLocal.current = "";

//     if (recognitionRef.current && isRecording) {
//       recognitionRef.current.stop();
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.lang = "en-US";
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognitionRef.current = recognition;

//     recognition.onstart = () => {
//       setIsRecording(true);
//       setError(null);
//     };

//     let autoSendTimer = null;

//     recognition.onresult = (e) => {
//       const transcript = Array.from(e.results)
//         .map(result => result[0].transcript)
//         .join("");

//       // Store transcript in REF (✔ FIX)
//       speechBufferRefLocal.current = transcript;
//       setInputValue(transcript);

//       if (autoSendTimer) {
//         clearTimeout(autoSendTimer);
//         autoSendTimer = null;
//       }
//     };

//     recognition.onerror = (e) => {
//       console.error("Speech Recognition Error:", e);
//       if (e.error !== "no-speech") {
//         setError("Error in speech recognition: " + e.error);
//       }
//       setIsRecording(false);
//     };

//     recognition.onend = () => {
//       setIsRecording(false);
//       recognitionRef.current = null;

//       // Auto-send after 3 seconds of silence
//       autoSendTimer = setTimeout(() => {
//         const finalText = speechBufferRefLocal.current.trim();

//         if (finalText) {
//           handleSendMessage(finalText);
//           speechBufferRefLocal.current = "";
//         }
//       }, 3000);
//     };

//     try {
//       recognition.start();
//     } catch (e) {
//       console.error("Recognition start failed:", e);
//       setIsRecording(false);
//     }
//   }, [isLoadingAI, isSpeaking, isRecording, handleSendMessage]);


//   // Replace your existing handleEndInterview in InterviewScreen.jsx with this:

//   const handleEndInterview = useCallback(async () => {
//     if (isLoadingAI || isSpeaking) return;

//     if (window.speechSynthesis.speaking) {
//       window.speechSynthesis.cancel();
//     }
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//       recognitionRef.current = null;
//     }

//     const reportText = generateReportContent(chatMessages, companyType, role);
//     const sanitizedRole = role.replace(/[^a-zA-Z0-9]/g, "_");
//     const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
//     const filename = `${sanitizedRole}_Report_${timestamp}.pdf`;

//     setIsLoadingAI(true);
//     setError("Analyzing the Interview");

//     try {
//       // 1️⃣ Upload PDF
//       const response = await fetch(BACKEND_UPLOAD_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           filename,
//           content: reportText,
//           role,
//           companyType,
//           solvedProblems,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.details || data.error || "Upload failed");
//       }

//       console.log("✅ Uploaded Report URL:", data.publicUrl);

//       // 2️⃣ Save to InterviewSession in DB (with messages and solved problems)
//       const sessionId = location.state?.sessionId;

//       if (sessionId) {
//         await fetch(
//           `http://localhost:5000/api/interview-session/complete/${sessionId}`,
//           {
//             method: "PATCH",
//             headers: { "Content-Type": "application/json" },
//             credentials: "include",
//             body: JSON.stringify({
//               reportUrl: data.publicUrl,
//               messages: chatMessages, // ✅ Send messages
//               solvedProblems: solvedProblems, // ✅ Send solved problems
//               highlightClips: Object.values(highlightBufferRef.current),
//             }),
//           }
//         );

//         console.log("✅ Interview session updated with messages and solved problems");
//       } else {
//         console.warn("⚠️ No sessionId found. Interview not linked in DB.");
//       }

//       // 3️⃣ Optional local storage (UI convenience)
//       localStorage.setItem(
//         "interviewReport",
//         JSON.stringify({
//           role,
//           companyType,
//           reportUrl: data.publicUrl,
//           timestamp: new Date().toISOString(),
//         })
//       );

//       setError("✅ Report saved! Redirecting to summary page...");

//       setTimeout(() => {
//         setError(null);
//         navigate("/after-interview", { replace: true });
//       }, 2500);
//     } catch (err) {
//       console.error("❌ Interview completion failed:", err);
//       setError(`❌ Report upload failed: ${err.message}`);
//     } finally {
//       setIsLoadingAI(false);
//     }
//   }, [
//     chatMessages,
//     solvedProblems, // ✅ Add to dependencies
//     companyType,
//     role,
//     isLoadingAI,
//     isSpeaking,
//     navigate,
//     location,
//   ]);


//   useEffect(() => {
//     if (isPreview) return;

//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: true,
//         });
//         setCameraAllowed(true);
//         userVideoRef.current.srcObject = stream;
//       } catch (err) {
//         setError("Camera/Mic access denied.");
//       }
//     };

//     startCamera();
//   }, [isPreview]);


//   // --- Remove any "auto-generate coding question before greeting" logic.
//   // Editor will be opened only when AI asks a coding question and we fetch one canonical problem.

//   useEffect(() => {
//     if (cameraAllowed && companyType && role && !greeted) {
//       const startAiConversation = async () => {
//         try {
//           const greetingPrompt = `
// You are Jenny, the AI interviewer.

// Your strict name is: "Jenny, your AI interviewer".
// Never refer to yourself as anything else.

// You are a friendly professional interviewer for a ${role} at a ${companyType}.
// Start the mock interview. Greet the candidate professionally, mention the company type "${companyType}" and the role "${role}",
// then begin with an appropriate first question (example: "Can you tell me about yourself?").
// `;


//           setIsLoadingAI(true);
//           setChatMessages([]);

//           const initialMessages = [
//             { role: "user", content: "Start the interview introduction." },
//           ];

//           const aiQ = await fetchFireworksContent(initialMessages, greetingPrompt);

//           const firstMsg = {
//             sender: "AI",
//             text: aiQ,
//             time: new Date().toLocaleTimeString(),
//           };
//           setChatMessages([firstMsg]);
//           await textToSpeech(aiQ);
//           setGreeted(true);
//         } catch (error) {
//           console.error("Error sending initial greeting:", error);
//           setError(error.message || "Failed to start AI conversation");
//         } finally {
//           setIsLoadingAI(false);
//         }
//       };
//       startAiConversation();
//     }
//   }, [cameraAllowed, companyType, role, greeted, fetchFireworksContent, textToSpeech]);

//   const toggleFullScreen = async () => {
//     const elem = screenRef.current;
//     if (!document.fullscreenElement) {
//       await elem.requestFullscreen();
//       setIsFullScreen(true);
//     } else {
//       await document.exitFullscreen();
//       setIsFullScreen(false);
//     }
//   };

//   if (!cameraAllowed && !error) {
//     return (
//       <div className="text-center mt-20 text-lg text-gray-700">
//         Requesting camera and microphone permission...
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">

//           {/* Header */}
//           <div className="flex items-center justify-between mb-8">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">
//                 {companyType} - {role}
//               </h1>
//               <p className="text-sm text-gray-600">
//                 Live AI-powered mock interview
//               </p>
//             </div>

//             <button
//               onClick={handleEndInterview}
//               className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center gap-2"
//             >
//               <PhoneOff size={18} />
//               End Interview
//             </button>
//           </div>

//           {/* Main Grid */}
//           <div className="grid grid-cols-3 gap-6">

//             {/* Left: Main Video */}
//             <div className="col-span-2 relative">
//               <div className="rounded-2xl overflow-hidden shadow-lg bg-black h-[420px] relative">
//                 <div className="absolute top-4 left-4 bg-indigo-200/80 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2">
//                   <div className="w-8 h-8 bg-indigo-300 rounded-full flex items-center justify-center text-xs font-medium text-indigo-700">
//                     TS
//                   </div>
//                   <span className="text-sm font-medium text-gray-800">Mrs. Tania Shahira</span>
//                 </div>
//                 {isPreview ? (
//                   <div className="w-full h-full bg-black flex items-center justify-center text-gray-400">
//                     Video disabled in preview
//                   </div>
//                 ) : (
//                   <video
//                     ref={userVideoRef}
//                     autoPlay
//                     playsInline
//                     muted
//                     className="w-full h-full object-cover scale-x-[-1]"
//                   />
//                 )}


//                 {/* AI Speaking Indicator */}
//                 {isSpeaking && (
//                   <div className="absolute top-4 left-4 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm animate-pulse">
//                     Jenny is speaking…
//                   </div>
//                 )}



//                 {/* Control Bar */}
//                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">

//                   {/* Mic */}
//                   <button
//                     onClick={startSpeechRecognition}
//                     className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${isRecording ? "bg-red-500" : "bg-white"
//                       }`}
//                   >
//                     <Mic className={isRecording ? "text-white" : "text-gray-700"} />
//                   </button>

//                   {/* Chat */}
//                   <button
//                     onClick={() => setIsChatOpen(true)}
//                     className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg"
//                   >
//                     <MessageSquare className="text-gray-700" />
//                   </button>

//                   {/* Code Editor */}
//                   <button
//                     onClick={() => setIsCodeEditorOpen(true)}
//                     className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg"
//                   >
//                     <Code className="text-gray-700" />
//                   </button>

//                   {/* Solved Problems */}
//                   {solvedProblems.length > 0 && (
//                     <button
//                       onClick={() => setShowSolvedProblems(true)}
//                       className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:bg-indigo-50 transition"
//                       title="View Solved Problems"
//                     >
//                       <ListChecks className="text-indigo-600" />
//                     </button>
//                   )}
//                 </div>

//               </div>

//               {/* Notes */}
//               <div className="mt-6 bg-white/50 backdrop-blur rounded-xl p-5">
//                 <h3 className="font-semibold text-gray-900 mb-2">
//                   Interview Progress
//                 </h3>
//                 <p className="text-sm text-gray-600">
//                   Current Stage: <strong>{interviewStage}</strong>
//                 </p>
//               </div>
//             </div>

//             {/* Right Sidebar */}
//             <div className="space-y-4">

//               {/* AI Video */}
//               <div className="relative rounded-xl overflow-hidden shadow-lg h-48 bg-black">
//                 <Canvas camera={{ position: [0, 0, 5] }}>
//                   <ambientLight intensity={0.6} />
//                   <Environment preset="studio" />
//                   <DynamicModel
//                     speechText={currentAiSpeech}
//                     onSpeechEnd={handleSpeechEnd}
//                   />
//                 </Canvas>

//                 <div className="absolute bottom-4 left-4 bg-indigo-200/80 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
//                   <span className="text-sm font-medium text-gray-800">
//                     Ms. Jenny
//                   </span>
//                 </div>

//               </div>

//               {/* Question List */}
//               <div className="bg-white/50 backdrop-blur rounded-xl p-4 flex flex-col h-[360px]">

//                 {/* Messages (SCROLLABLE) */}
//                 <div className="flex-1 overflow-y-auto pr-2">
//                   <h4 className="font-semibold text-gray-900 mb-3">
//                     Conversation
//                   </h4>

//                   {chatMessages.map((msg, idx) => (
//                     <div
//                       key={idx}
//                       className={`mb-3 text-sm ${msg.sender === "User"
//                           ? "text-right text-indigo-700"
//                           : "text-left text-gray-800"
//                         }`}
//                     >
//                       <p className="inline-block px-3 py-2 rounded-lg bg-white shadow">
//                         {msg.text}
//                       </p>
//                     </div>
//                   ))}

//                   {isLoadingAI && (
//                     <p className="text-sm text-gray-500 italic">
//                       Jenny is thinking…
//                     </p>
//                   )}
//                 </div>

//                 {/* INPUT BAR (FIXED, ALWAYS VISIBLE) */}
//                 <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2">
//                   <input
//                     type="text"
//                     value={inputValue}
//                     onChange={(e) => setInputValue(e.target.value)}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter" && inputValue.trim()) {
//                         handleSendMessage(inputValue);
//                       }
//                     }}
//                     placeholder="Type your answer here (testing)…"
//                     className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//                   />

//                   <button
//                     onClick={() => handleSendMessage(inputValue)}
//                     disabled={!inputValue.trim() || isLoadingAI || isSpeaking}
//                     className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm disabled:opacity-50"
//                   >
//                     Send
//                   </button>
//                 </div>
//               </div>

//             </div>
//           </div>

//           {/* Modals */}
//           {isCodeEditorOpen && (
//             <CodeEditorModal
//               isOpen={isCodeEditorOpen}
//               onClose={() => setIsCodeEditorOpen(false)}
//               problem={codingProblem}

//               onSuccess={async (userCode, testResults) => {
//                 // Save solved problem
//                 setSolvedProblems((prev) => [
//                   ...prev,
//                   {
//                     problem: codingProblem,
//                     userCode,
//                     testResults,
//                     skipped: false,
//                     solvedAt: new Date().toISOString(),
//                   },
//                 ]);

//                 setIsCodeEditorOpen(false);

//                 // Increase coding count
//                 setCodingCount((prev) => prev + 1);

//                 setTimeout(async () => {
//                   const nextCount = codingCount + 1;

//                   // If 3 problems completed → end coding round
//                   if (nextCount >= 3) {
//                     const msg =
//                       "Great work! That concludes the coding round. We will now move to the next round.";

//                     setChatMessages((prev) => [
//                       ...prev,
//                       {
//                         sender: "AI",
//                         text: msg,
//                         time: new Date().toLocaleTimeString(),
//                         stage: "post-coding",
//                       },
//                     ]);

//                     textToSpeech(msg);
//                     setInterviewStage("final");
//                     return;
//                   }

//                   // Otherwise fetch next problem
//                   try {
//                     const { problem: nextProblem } =
//                       await fetchAndFormatCodingProblem();

//                     setCodingProblem(nextProblem);

//                     setChatMessages((prev) => [
//                       ...prev,
//                       {
//                         sender: "AI",
//                         text:
//                           "A new coding problem has been generated. Please open the Code Editor to solve it.",
//                         time: new Date().toLocaleTimeString(),
//                         stage: "coding",
//                       },
//                     ]);

//                     setTimeout(() => setIsCodeEditorOpen(true), 500);
//                   } catch (err) {
//                     console.error(err);
//                     setError("Failed to fetch next coding problem.");
//                   }
//                 }, 300);
//               }}

//               onSkip={async () => {
//                 // Save skipped problem
//                 setSolvedProblems((prev) => [
//                   ...prev,
//                   {
//                     problem: codingProblem,
//                     userCode: null,
//                     testResults: null,
//                     skipped: true,
//                     solvedAt: new Date().toISOString(),
//                   },
//                 ]);

//                 setIsCodeEditorOpen(false);

//                 setCodingCount((prev) => prev + 1);

//                 setTimeout(async () => {
//                   const nextCount = codingCount + 1;

//                   if (nextCount >= 3) {
//                     const msg =
//                       "That concludes the coding round. Let's move to the next round.";

//                     setChatMessages((prev) => [
//                       ...prev,
//                       {
//                         sender: "AI",
//                         text: msg,
//                         time: new Date().toLocaleTimeString(),
//                         stage: "post-coding",
//                       },
//                     ]);

//                     textToSpeech(msg);
//                     setInterviewStage("final");
//                     return;
//                   }

//                   try {
//                     const { problem: nextProblem } =
//                       await fetchAndFormatCodingProblem();

//                     setCodingProblem(nextProblem);

//                     setChatMessages((prev) => [
//                       ...prev,
//                       {
//                         sender: "AI",
//                         text:
//                           "A new coding problem has been generated. Please open the Code Editor to solve it.",
//                         time: new Date().toLocaleTimeString(),
//                         stage: "coding",
//                       },
//                     ]);

//                     setTimeout(() => setIsCodeEditorOpen(true), 500);
//                   } catch (err) {
//                     console.error(err);
//                     setError("Failed to fetch next coding problem.");
//                   }
//                 }, 300);
//               }}
//             />
//           )}


//           {showSolvedProblems && (
//             <SolvedProblemsModal
//               isOpen={showSolvedProblems}
//               onClose={() => setShowSolvedProblems(false)}
//               problems={solvedProblems}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );

// };

// export default InterviewScreen;
