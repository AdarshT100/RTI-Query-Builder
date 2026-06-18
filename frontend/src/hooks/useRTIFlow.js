    import { useState } from "react";
    import { analyzeComplaint, generateRTI } from "../services/api";

    export function useRTIFlow() {
    const [stage, setStage] = useState("input");
    const [complaint, setComplaint] = useState("");
    const [questions, setQuestions] = useState([]);
    const [languageNote, setLanguageNote] = useState(null);
    const [rtiDraft, setRTIDraft] = useState(null);
    const [nonRTIableData, setNonRTIableData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState(null);
    const [error, setError] = useState(null);

    function mapError(err) {
        if (err.status === 429)
        return "You have reached the limit for today. Please try again tomorrow.";
        if (err.status === 0)
        return "Could not reach the server. Please check your internet connection and try again.";
        return "Something went wrong on our end. Please try again later.";
    }

    function handleReset() {
        setStage("input");
        setComplaint("");
        setQuestions([]);
        setLanguageNote(null);
        setRTIDraft(null);
        setNonRTIableData(null);
        setIsLoading(false);
        setLoadingStage(null);
        setError(null);
    }

    async function _runStageTwo(submittedComplaint, answers) {
        setLoadingStage("generating");
        try {
        const data = await generateRTI(submittedComplaint, answers);
        // console.log("[stage2 response]", data);
        setRTIDraft(data);
        setStage("draft");
        } catch (err) {
        setError(mapError(err));
        } finally {
        setIsLoading(false);
        setLoadingStage(null);
        }
    }

    async function handleComplaintSubmit(submittedComplaint, captcha_token) {
        setIsLoading(true);
        setLoadingStage("analyzing");
        setError(null);
        setComplaint(submittedComplaint);

        try {
        const data = await analyzeComplaint(submittedComplaint, captcha_token);
        // console.log("[stage1 response]", data);

        if (data.non_rti_able) {
            setNonRTIableData({
            variant: "non_rti_able",
            reason: data.reason,
            alternative: data.alternative ?? null,
            });
            setStage("non_rti_able");
            setIsLoading(false);
            setLoadingStage(null);
            return;
        }

        if (data.insufficient_context) {
            setNonRTIableData({
            variant: "insufficient_context",
            prompt: data.prompt,
            });
            setStage("non_rti_able");
            setIsLoading(false);
            setLoadingStage(null);
            return;
        }

        const qs = data.questions ?? [];
        const note = data.language_note ?? null;

        if (qs.length === 0) {
            setLanguageNote(note);
            await _runStageTwo(submittedComplaint, {});
            return;
        }

        setQuestions(qs);
        setLanguageNote(note);
        setStage("questions");
        setIsLoading(false);
        setLoadingStage(null);
        } catch (err) {
        setError(mapError(err));
        setIsLoading(false);
        setLoadingStage(null);
        }
    }

    async function handleAnswersSubmit(answers) {
        setIsLoading(true);
        setError(null);
        await _runStageTwo(complaint, answers);
    }

    function handleErrorDismiss() {
        setError(null);
    }

    return {
        stage,
        complaint,
        questions,
        languageNote,
        rtiDraft,
        nonRTIableData,
        isLoading,
        loadingStage,
        error,
        handleReset,
        handleComplaintSubmit,
        handleAnswersSubmit,
        handleErrorDismiss,
    };
    }