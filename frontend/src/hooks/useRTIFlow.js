import {useState} from "react";
import { analyzeComplaint, generateRTI } from "../services/api";

export function useRTIFlow(){
    const [stage, setStage] = useState("input");

    const [complaint, setComplaint] = useState("");
    const [questions, setQuestions]= useState([]);
    const [languageNote, setLanguageNote] = useState(null);
    const [rtiDraft, setRTIDraft] = useState(null);
    const [nonRTIableData, setNonRTIableData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    function mapError(err){
        if(err.status==429)
            return "You have reached the limit for today. Please try again tomorrow.";
        if(err.status==0)
            return "Could not reach the server. Please check your internet connection and try again.";
        return "Something went wrong on our end please try again later.";
    }

    function handleReset(){
        setStage("input");
        setComplaint("");
        setQuestions([]);
        setLanguageNote(null);
        setRTIDraft(null);
        setNonRTIableData(null);
        setIsLoading(false);
        setError(null);
    }

    async function handleComplaintSubmit(complaint, captcha_token){
        console.log("[stub] handleComplaintSubmit called", {
            complaint,
            captcha_token,
        });
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 500);
    }

    async function handleAnswerSubmit(answers){
        console.log("[stub] handleAnswerSubmit called" , {answers});
        setIsLoading(true);
        setTimeout(() => setIsLoading(false),500);
    }
    function handleErrorDismiss(){
        setError(null);
    }
    return{
        stage,
        complaint,
        questions,
        languageNote,
        rtiDraft,
        nonRTIableData,
        isLoading,
        error,
        handleReset,
        handleComplaintSubmit,
        handleAnswerSubmit,
        handleErrorDismiss
    };
}