import { useState } from 'react';

export default function useRTIFlow() {
  const [stage, setStage] = useState('input');
  const [complaint, setComplaint] = useState('');
  const [questions, setQuestions] = useState([]);
  const [rtiDraft, setRtiDraft] = useState(null);
  const [nonRTIableData, setNonRTIableData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleReset() {
    setStage('input');
    setComplaint('');
    setQuestions([]);
    setRtiDraft(null);
    setNonRTIableData(null);
    setIsLoading(false);
    setError(null);
  }

  function handleComplaintSubmit(value, captchaToken) {
    console.log('handleComplaintSubmit', value, captchaToken);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  }

  function handleAnswersSubmit(answers) {
    console.log('handleAnswersSubmit', answers);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  }

  return {
    stage,
    complaint,
    questions,
    rtiDraft,
    nonRTIableData,
    isLoading,
    error,
    handleReset,
    handleComplaintSubmit,
    handleAnswersSubmit,
  };
}
