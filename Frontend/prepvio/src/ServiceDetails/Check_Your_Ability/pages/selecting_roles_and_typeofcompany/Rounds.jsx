import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PlayCircle, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Rounds = ({ companyType, role }) => {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/companies/${encodeURIComponent(
            companyType
          )}/${encodeURIComponent(role)}/rounds`
        );
        setRounds(res.data.rounds || []);
      } catch (err) {
        console.error("Error fetching rounds:", err);
      } finally {
        setLoading(false);
      }
    };

    if (companyType && role) fetchRounds();
  }, [companyType, role]);

  const handleStartInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());

      const res = await axios.post(
        "http://localhost:5000/api/interview-session/start",
        { companyType, role },
        { withCredentials: true }
      );

      const sessionId = res.data.sessionId;

      navigate("/services/check-your-ability/interview", {
        state: {
          companyType,
          role,
          rounds,
          sessionId,
          preventBack: true,
        },
        replace: true,
      });
    } catch (error) {
      console.error(error);
      alert("⚠️ Please allow camera access or login again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const roundVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 20,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto border-4 border-[#D4F478] border-t-transparent rounded-full"
          />
          <p className="text-gray-600 text-lg font-medium">
            Loading interview rounds…
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF9] p-6 font-sans selection:bg-[#D4F478] selection:text-black flex items-center justify-center relative overflow-hidden">
      {/* Background decorations matching Home.js */}
      <div className="fixed inset-0 pointer-events-none -z-50">
        <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-gradient-to-b from-blue-50 to-transparent rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-t from-pink-50 to-transparent rounded-full blur-[120px] opacity-60" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-4xl bg-white/40 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-white/60 p-10 md:p-16 space-y-10 relative overflow-hidden"
      >
        {/* Floating decorations */}
        <motion.div
          animate={{
            y: [0, -12, 0],
            rotate: [0, 4, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-8 -right-8 w-32 h-32 bg-purple-200/40 rounded-full blur-3xl pointer-events-none"
        />
        
        <motion.div
          animate={{
            y: [0, 12, 0],
            rotate: [0, -4, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"
        />

        {/* Header */}
        <motion.div variants={itemVariants} className="text-center space-y-3 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6 text-[#D4F478]" />
            </motion.div>
            <span className="text-sm font-bold uppercase tracking-widest text-gray-400">
              Interview Preparation
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-tight">
            Interview Rounds
          </h1>
          
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 100 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="h-1.5 bg-[#D4F478] mx-auto rounded-full"
          />
          
          <div className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto font-medium pt-2">
            Practice interview for{" "}
            <span className="font-bold text-gray-900 bg-[#D4F478]/20 px-3 py-1 rounded-full">
              {companyType}
            </span>{" "}
            -{" "}
            <span className="font-bold text-gray-900 bg-[#D4F478]/20 px-3 py-1 rounded-full">
              {role}
            </span>
          </div>
        </motion.div>

        {/* Rounds List */}
        <motion.div variants={itemVariants} className="space-y-4 relative z-10">
          {rounds.length > 0 ? (
            <AnimatePresence>
              {rounds.map((round, index) => (
                <motion.div
                  key={index}
                  variants={roundVariants}
                  custom={index}
                  whileHover={{
                    y: -4,
                    scale: 1.01,
                    boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.08)",
                  }}
                  className="bg-white/90 backdrop-blur-lg border-2 border-gray-100 rounded-[2rem] p-6 md:p-7 shadow-lg hover:border-[#D4F478]/30 transition-all cursor-pointer relative overflow-hidden group"
                >
                  {/* Decorative gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D4F478]/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="shrink-0 w-12 h-12 bg-[#D4F478]/20 rounded-2xl flex items-center justify-center text-[#1A1A1A] font-black text-lg border-2 border-[#D4F478]/30"
                    >
                      {index + 1}
                    </motion.div>
                    
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        {round.name}
                        <CheckCircle2 className="w-5 h-5 text-[#D4F478] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {round.description}
                      </p>
                      
                      {/* Optional duration indicator */}
                      {round.duration && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 font-medium">
                          <Clock className="w-4 h-4" />
                          <span>{round.duration} minutes</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-white/60 rounded-[2rem] border-2 border-dashed border-gray-200"
            >
              <p className="text-gray-500 text-lg italic font-medium">
                No rounds configured for this role.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-between pt-8 border-t border-gray-200/50 relative z-10"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-gray-200 text-gray-700 bg-white/90 hover:bg-white hover:border-gray-300 transition-all font-bold shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={20} />
            Change Selection
          </motion.button>

          <motion.button
            whileHover="hover"
            whileTap="tap"
            onClick={handleStartInterview}
            className="flex items-center gap-0 group cursor-pointer"
          >
            <span className="bg-[#1A1A1A] text-white px-8 py-4 rounded-l-full font-bold text-lg shadow-xl shadow-gray-300/50 z-10 relative flex items-center gap-2">
              {/* <PlayCircle size={20} /> */}
              Start Practice Interview
            </span>
            <motion.span
              className="w-14 h-[3.75rem] flex items-center justify-center rounded-r-full bg-[#D4F478] border-l-2 border-[#1A1A1A] group-hover:bg-[#cbf060] transition-colors origin-left"
              variants={{
                hover: { x: 5 },
                tap: { x: 0 },
              }}
            >
              <motion.div
                variants={{
                  hover: { x: 3 },
                  tap: { x: 0 },
                }}
              >
                <PlayCircle className="w-6 h-6 text-black" />
              </motion.div>
            </motion.span>
          </motion.button>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-3 pt-4"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#D4F478]" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Step 2 of 2
            </span>
            <div className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Rounds;


















// ---- actual correct working code below ----
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft, PlayCircle } from "lucide-react";

// const Rounds = ({ companyType, role }) => {
//   const [rounds, setRounds] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchRounds = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:5000/api/companies/${encodeURIComponent(
//             companyType
//           )}/${encodeURIComponent(role)}/rounds`
//         );
//         setRounds(res.data.rounds || []);
//       } catch (err) {
//         console.error("Error fetching rounds:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (companyType && role) fetchRounds();
//   }, [companyType, role]);

//   const handleStartInterview = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//       stream.getTracks().forEach((track) => track.stop());

//       const res = await axios.post(
//         "http://localhost:5000/api/interview-session/start",
//         { companyType, role },
//         { withCredentials: true }
//       );

//       const sessionId = res.data.sessionId;

//       navigate("/services/check-your-ability/interview", {
//         state: {
//           companyType,
//           role,
//           rounds,
//           sessionId,
//           preventBack: true,
//         },
//         replace: true,
//       });
//     } catch (error) {
//       console.error(error);
//       alert("⚠️ Please allow camera access or login again.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
//         Loading interview rounds…
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-6 flex items-center justify-center">
//       <div className="w-full max-w-3xl bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-10 space-y-10">

//         {/* Header */}
//         <div className="text-center space-y-2">
//           <h1 className="text-3xl font-bold text-gray-900">
//             Interview Rounds
//           </h1>
//           <p className="text-gray-600 text-base">
//             Practice interview for{" "}
//             <span className="font-semibold text-indigo-600">
//               {companyType}
//             </span>{" "}
//             -{" "}
//             <span className="font-semibold text-indigo-600">
//               {role}
//             </span>
//           </p>
//         </div>

//         {/* Rounds List */}
//         <div className="space-y-4">
//           {rounds.length > 0 ? (
//             rounds.map((round, index) => (
//               <div
//                 key={index}
//                 className="bg-white/60 backdrop-blur-lg border border-white/50 rounded-xl p-5 shadow hover:shadow-lg transition"
//               >
//                 <h3 className="text-lg font-semibold text-indigo-700 mb-1">
//                   {round.name}
//                 </h3>
//                 <p className="text-gray-700 text-sm leading-relaxed">
//                   {round.description}
//                 </p>
//               </div>
//             ))
//           ) : (
//             <p className="text-center text-gray-500 italic">
//               No rounds configured for this role.
//             </p>
//           )}
//         </div>

//         {/* Actions */}
//         <div className="flex flex-col sm:flex-row gap-4 justify-between pt-6 border-t border-white/50">
//           <button
//             onClick={() => navigate(-1)}
//             className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-gray-400 text-gray-700 bg-white hover:bg-gray-100 transition"
//           >
//             <ArrowLeft size={18} />
//             Change Selection
//           </button>

//           <button
//             onClick={handleStartInterview}
//             className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:scale-[1.03] transition"
//           >
//             <PlayCircle size={20} />
//             Start Practice Interview
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Rounds;
