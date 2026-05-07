import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Mic, X, Send, Play, RotateCcw } from "lucide-react";
import "./VoicePopup.css";

export default function VoicePopup({ isOpen, onClose, contractText }) {
  const [isListening, setIsListening] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState("");
  const [voiceResponse, setVoiceResponse] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const recognitionRef = useRef(null);
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setVoiceQuery(currentTranscript);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && contractText) {
      axios.post("http://localhost:8000/voice-suggestions", { contract_text: contractText })
        .then(res => setSuggestions(res.data.suggestions))
        .catch(() => setSuggestions([
          "What happens if I terminate?",
          "Any hidden penalties?",
          "Is the non-compete enforceable?"
        ]));
    }
  }, [isOpen, contractText]);

  const handleVoiceToggle = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setVoiceQuery("");
      setVoiceResponse("");
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSendQuery = async (queryOverride) => {
    const finalQuery = queryOverride || voiceQuery;
    if (!finalQuery) return;

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/voice-ask", {
        contract_text: contractText,
        query: finalQuery
      });
      setVoiceResponse(response.data.answer);
    } catch (error) {
      setVoiceResponse("Error analyzing contract. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="vp-overlay">
      <div className="vp-modal">
        <button className="vp-close" onClick={onClose}><X size={20} /></button>
        
        <div className="vp-header">
          <div className="vp-icon-bg"><Mic size={24} /></div>
          <div>
            <h3>AI Voice Legal Assistant</h3>
            <p>Voice Interaction</p>
          </div>
        </div>

        <div className="vp-body">
          {/* THE ORB SECTION */}
          <div className={`vp-orb-wrapper ${isListening ? 'listening' : ''}`} onClick={handleVoiceToggle}>
            <div className="vp-orb">
               <Mic color="white" size={40} />
            </div>
          </div>

          <div className="vp-status">
            {isListening ? "Listening..." : voiceResponse ? "Processing Complete" : "Tap to Start Speaking"}
          </div>

          <div className="vp-hint">
            Ask any question about your contract using natural language. The AI will analyze your document context and provide detailed answers.
          </div>

          {/* EXAMPLES / SUGGESTIONS */}
          {!isListening && !voiceResponse && (
            <div className="vp-suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="vp-sug-btn" onClick={() => {
                    setVoiceQuery(s);
                    handleSendQuery(s);
                }}>
                  "{s}"
                </button>
              ))}
            </div>
          )}

          {/* TRANSCRIPT & EDITING AREA */}
          {(voiceQuery || isListening) && (
            <div className="vp-transcript-container">
              <div className="vp-label">YOUR QUESTION</div>
              <div className="vp-input-wrapper">
                <textarea 
                  value={voiceQuery} 
                  onChange={(e) => setVoiceQuery(e.target.value)}
                  placeholder="Listening for your question..."
                  readOnly={isListening}
                />
                {!isListening && voiceQuery && !voiceResponse && (
                   <button className="vp-send-btn" onClick={() => handleSendQuery()} disabled={isLoading}>
                     {isLoading ? "..." : <Send size={18} />}
                   </button>
                )}
              </div>

              {voiceResponse && (
                <div className="vp-response-area">
                   <div className="vp-label ai">AI RESPONSE</div>
                   <p className="vp-response-text">{voiceResponse}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}